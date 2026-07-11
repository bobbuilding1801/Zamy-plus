#!/usr/bin/env python3
"""
Backend API Phase 2 tests for ZAMY marketplace
Tests NEW Phase 2 endpoints only (previous 22 tests already passed)
"""

import requests
import json
import sys

BASE_URL = "https://zamy-commerce.preview.emergentagent.com/api"

def test_track_order():
    """Test A) GET /api/track/:orderId endpoint"""
    print("\n=== Testing Order Tracking ===")
    all_passed = True
    
    # Test with ORD10001
    try:
        print("\n  Testing track/ORD10001")
        response = requests.get(f"{BASE_URL}/track/ORD10001")
        print(f"  Status: {response.status_code}")
        data = response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'orderId' in data, "Expected 'orderId' in response"
        assert data['orderId'] == 'ORD10001', f"Expected orderId='ORD10001', got {data.get('orderId')}"
        assert 'courier' in data, "Expected 'courier' in response"
        assert isinstance(data['courier'], str), "courier should be a string"
        assert 'awb' in data, "Expected 'awb' in response"
        assert data['awb'].startswith('ZMY'), f"Expected awb to start with 'ZMY', got {data.get('awb')}"
        assert 'stages' in data, "Expected 'stages' in response"
        
        stages = data['stages']
        assert isinstance(stages, list), "stages should be an array"
        assert len(stages) == 5, f"Expected 5 stages, got {len(stages)}"
        
        # Verify each stage has required keys
        for i, stage in enumerate(stages):
            assert 'key' in stage, f"Stage {i} missing 'key'"
            assert 'label' in stage, f"Stage {i} missing 'label'"
            assert 'done' in stage, f"Stage {i} missing 'done'"
            assert isinstance(stage['done'], bool), f"Stage {i} 'done' should be boolean"
            assert 'at' in stage, f"Stage {i} missing 'at'"
            assert isinstance(stage['at'], (int, float)), f"Stage {i} 'at' should be number/ms"
        
        print(f"  ✓ ORD10001 tracking: {len(stages)} stages, courier={data['courier']}, awb={data['awb']}")
        
    except Exception as e:
        print(f"  ❌ Track ORD10001 FAILED: {e}")
        all_passed = False
    
    # Test with different order id (TEST123)
    try:
        print("\n  Testing track/TEST123")
        response = requests.get(f"{BASE_URL}/track/TEST123")
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'orderId' in data, "Expected 'orderId' in response"
        assert data['orderId'] == 'TEST123', f"Expected orderId='TEST123', got {data.get('orderId')}"
        assert 'stages' in data, "Expected 'stages' in response"
        assert len(data['stages']) == 5, f"Expected 5 stages, got {len(data['stages'])}"
        
        print(f"  ✓ TEST123 tracking: valid shape with 5 stages")
        
    except Exception as e:
        print(f"  ❌ Track TEST123 FAILED: {e}")
        all_passed = False
    
    if all_passed:
        print("\n✅ Order tracking test PASSED")
    else:
        print("\n❌ Order tracking test FAILED")
    return all_passed

def test_admin_analytics():
    """Test B) GET /api/admin/analytics endpoint"""
    print("\n=== Testing Admin Analytics ===")
    try:
        response = requests.get(f"{BASE_URL}/admin/analytics")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check revenue array
        assert 'revenue' in data, "Expected 'revenue' in response"
        revenue = data['revenue']
        assert isinstance(revenue, list), "revenue should be an array"
        assert len(revenue) == 30, f"Expected exactly 30 revenue items, got {len(revenue)}"
        
        # Verify revenue item structure
        if revenue:
            item = revenue[0]
            assert 'date' in item, "Revenue item missing 'date'"
            assert 'revenue' in item, "Revenue item missing 'revenue'"
            assert 'orders' in item, "Revenue item missing 'orders'"
            assert isinstance(item['revenue'], (int, float)), "revenue should be a number"
            assert isinstance(item['orders'], (int, float)), "orders should be a number"
            # Verify date format YYYY-MM-DD
            date_str = item['date']
            assert len(date_str) == 10 and date_str[4] == '-' and date_str[7] == '-', f"Date should be YYYY-MM-DD format, got {date_str}"
            print(f"  ✓ Revenue array: {len(revenue)} items, sample: {item}")
        
        # Check catShare array
        assert 'catShare' in data, "Expected 'catShare' in response"
        catShare = data['catShare']
        assert isinstance(catShare, list), "catShare should be an array"
        if catShare:
            item = catShare[0]
            assert 'name' in item, "catShare item missing 'name'"
            assert 'value' in item, "catShare item missing 'value'"
            print(f"  ✓ catShare array: {len(catShare)} items")
        
        # Check topProducts array
        assert 'topProducts' in data, "Expected 'topProducts' in response"
        topProducts = data['topProducts']
        assert isinstance(topProducts, list), "topProducts should be an array"
        assert len(topProducts) >= 5, f"Expected at least 5 topProducts, got {len(topProducts)}"
        if topProducts:
            item = topProducts[0]
            assert 'id' in item, "topProducts item missing 'id'"
            assert 'name' in item, "topProducts item missing 'name'"
            assert 'sold' in item, "topProducts item missing 'sold'"
            assert 'revenue' in item, "topProducts item missing 'revenue'"
            print(f"  ✓ topProducts array: {len(topProducts)} items")
        
        # Check totals object
        assert 'totals' in data, "Expected 'totals' in response"
        totals = data['totals']
        assert isinstance(totals, dict), "totals should be an object"
        assert 'revenue' in totals, "totals missing 'revenue'"
        assert 'orders' in totals, "totals missing 'orders'"
        assert 'customers' in totals, "totals missing 'customers'"
        assert 'aov' in totals, "totals missing 'aov'"
        assert isinstance(totals['revenue'], (int, float)), "totals.revenue should be a number"
        assert isinstance(totals['orders'], (int, float)), "totals.orders should be a number"
        assert isinstance(totals['customers'], (int, float)), "totals.customers should be a number"
        assert isinstance(totals['aov'], (int, float)), "totals.aov should be a number"
        print(f"  ✓ totals: revenue={totals['revenue']}, orders={totals['orders']}, customers={totals['customers']}, aov={totals['aov']}")
        
        print("✅ Admin analytics test PASSED")
        return True
    except Exception as e:
        print(f"❌ Admin analytics test FAILED: {e}")
        return False

def test_admin_orders():
    """Test C) GET /api/admin/orders endpoint"""
    print("\n=== Testing Admin Orders ===")
    try:
        response = requests.get(f"{BASE_URL}/admin/orders")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 20, f"Expected at least 20 orders, got {len(items)}"
        
        # Verify item structure
        if items:
            item = items[0]
            assert 'id' in item, "Order item missing 'id'"
            assert 'customer' in item, "Order item missing 'customer'"
            assert 'email' in item, "Order item missing 'email'"
            assert 'productId' in item, "Order item missing 'productId'"
            assert 'product' in item, "Order item missing 'product'"
            assert 'image' in item, "Order item missing 'image'"
            assert 'total' in item, "Order item missing 'total'"
            assert 'status' in item, "Order item missing 'status'"
            print(f"  ✓ Orders: {len(items)} items, sample: id={item['id']}, customer={item['customer']}, total={item['total']}")
        
        print("✅ Admin orders test PASSED")
        return True
    except Exception as e:
        print(f"❌ Admin orders test FAILED: {e}")
        return False

def test_admin_customers():
    """Test D) GET /api/admin/customers endpoint"""
    print("\n=== Testing Admin Customers ===")
    try:
        response = requests.get(f"{BASE_URL}/admin/customers")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 20, f"Expected at least 20 customers, got {len(items)}"
        
        # Verify item structure
        if items:
            item = items[0]
            assert 'id' in item, "Customer item missing 'id'"
            assert 'name' in item, "Customer item missing 'name'"
            assert 'email' in item, "Customer item missing 'email'"
            assert 'orders' in item, "Customer item missing 'orders'"
            assert 'spend' in item, "Customer item missing 'spend'"
            assert 'joined' in item, "Customer item missing 'joined'"
            print(f"  ✓ Customers: {len(items)} items, sample: id={item['id']}, name={item['name']}, orders={item['orders']}, spend={item['spend']}")
        
        print("✅ Admin customers test PASSED")
        return True
    except Exception as e:
        print(f"❌ Admin customers test FAILED: {e}")
        return False

def test_admin_coupons():
    """Test E) GET /api/admin/coupons endpoint"""
    print("\n=== Testing Admin Coupons ===")
    try:
        response = requests.get(f"{BASE_URL}/admin/coupons")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 4, f"Expected at least 4 coupons, got {len(items)}"
        
        # Verify at least one item has code === 'WELCOME10'
        codes = [item.get('code') for item in items]
        assert 'WELCOME10' in codes, f"Expected to find 'WELCOME10' coupon, got codes: {codes}"
        
        print(f"  ✓ Coupons: {len(items)} items, codes: {codes}")
        print("✅ Admin coupons test PASSED")
        return True
    except Exception as e:
        print(f"❌ Admin coupons test FAILED: {e}")
        return False

def test_admin_reviews():
    """Test F) GET /api/admin/reviews endpoint"""
    print("\n=== Testing Admin Reviews ===")
    try:
        response = requests.get(f"{BASE_URL}/admin/reviews")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 10, f"Expected at least 10 reviews, got {len(items)}"
        
        # Verify item structure
        if items:
            item = items[0]
            assert 'productId' in item, "Review item missing 'productId'"
            assert 'product' in item, "Review item missing 'product'"
            assert 'image' in item, "Review item missing 'image'"
            assert 'rating' in item, "Review item missing 'rating'"
            assert 'body' in item, "Review item missing 'body'"
            assert 'status' in item, "Review item missing 'status'"
            print(f"  ✓ Reviews: {len(items)} items, sample: productId={item['productId']}, rating={item['rating']}, status={item['status']}")
        
        print("✅ Admin reviews test PASSED")
        return True
    except Exception as e:
        print(f"❌ Admin reviews test FAILED: {e}")
        return False

def test_seller_analytics():
    """Test G) GET /api/seller/analytics endpoint"""
    print("\n=== Testing Seller Analytics ===")
    try:
        response = requests.get(f"{BASE_URL}/seller/analytics")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check revenue array
        assert 'revenue' in data, "Expected 'revenue' in response"
        revenue = data['revenue']
        assert isinstance(revenue, list), "revenue should be an array"
        assert len(revenue) == 14, f"Expected exactly 14 revenue items, got {len(revenue)}"
        
        # Verify revenue item structure
        if revenue:
            item = revenue[0]
            assert 'date' in item, "Revenue item missing 'date'"
            assert 'revenue' in item, "Revenue item missing 'revenue'"
            assert 'orders' in item, "Revenue item missing 'orders'"
            print(f"  ✓ Revenue array: {len(revenue)} items")
        
        # Check products array
        assert 'products' in data, "Expected 'products' in response"
        products = data['products']
        assert isinstance(products, list), "products should be an array"
        # May be small, ok if <= 8
        if products:
            item = products[0]
            assert 'id' in item, "Product item missing 'id'"
            assert 'name' in item, "Product item missing 'name'"
            assert 'price' in item, "Product item missing 'price'"
            assert 'images' in item, "Product item missing 'images'"
            print(f"  ✓ Products array: {len(products)} items")
        
        # Check totals object
        assert 'totals' in data, "Expected 'totals' in response"
        totals = data['totals']
        assert isinstance(totals, dict), "totals should be an object"
        assert 'revenue' in totals, "totals missing 'revenue'"
        assert 'orders' in totals, "totals missing 'orders'"
        assert 'pendingPayout' in totals, "totals missing 'pendingPayout'"
        assert 'rating' in totals, "totals missing 'rating'"
        assert isinstance(totals['revenue'], (int, float)), "totals.revenue should be a number"
        assert isinstance(totals['orders'], (int, float)), "totals.orders should be a number"
        assert isinstance(totals['pendingPayout'], (int, float)), "totals.pendingPayout should be a number"
        assert isinstance(totals['rating'], (int, float)), "totals.rating should be a number"
        print(f"  ✓ totals: revenue={totals['revenue']}, orders={totals['orders']}, pendingPayout={totals['pendingPayout']}, rating={totals['rating']}")
        
        print("✅ Seller analytics test PASSED")
        return True
    except Exception as e:
        print(f"❌ Seller analytics test FAILED: {e}")
        return False

def test_seller_orders():
    """Test H) GET /api/seller/orders endpoint"""
    print("\n=== Testing Seller Orders ===")
    try:
        response = requests.get(f"{BASE_URL}/seller/orders")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        
        # Verify item structure
        if items:
            item = items[0]
            assert 'id' in item, "Order item missing 'id'"
            assert 'product' in item, "Order item missing 'product'"
            assert 'qty' in item, "Order item missing 'qty'"
            assert 'total' in item, "Order item missing 'total'"
            assert 'status' in item, "Order item missing 'status'"
            print(f"  ✓ Seller orders: {len(items)} items, sample: id={item['id']}, product={item['product']}, qty={item['qty']}, total={item['total']}")
        
        print("✅ Seller orders test PASSED")
        return True
    except Exception as e:
        print(f"❌ Seller orders test FAILED: {e}")
        return False

def test_ai_chat():
    """Test I) POST /api/ai/chat endpoint"""
    print("\n=== Testing AI Chat ===")
    all_passed = True
    
    # Test 1: Gaming laptop query
    try:
        print("\n  Testing AI chat with gaming laptop query")
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": "Suggest a gaming laptop under 150000 with RTX 4070"
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=chat_data, headers={"Content-Type": "application/json"})
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'reply' in data, "Expected 'reply' in response"
        
        reply = data['reply']
        assert isinstance(reply, str), "reply should be a string"
        assert len(reply) > 20, f"Expected reply length > 20 characters, got {len(reply)}"
        
        # Verify it's NOT the exact canned fallback text
        canned_fallback = "I'm here to help with products, orders, delivery, returns and payments on ZAMY. What are you looking for today?"
        assert reply != canned_fallback, f"Reply should not be the exact canned fallback text. Got: {reply}"
        
        print(f"  ✓ AI chat reply (length={len(reply)}): {reply[:100]}...")
        
    except Exception as e:
        print(f"  ❌ AI chat gaming laptop query FAILED: {e}")
        all_passed = False
    
    # Test 2: Return policy query
    try:
        print("\n  Testing AI chat with return policy query")
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": "What is your return policy?"
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=chat_data, headers={"Content-Type": "application/json"})
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'reply' in data, "Expected 'reply' in response"
        
        reply = data['reply']
        assert isinstance(reply, str), "reply should be a string"
        assert len(reply) > 0, "reply should not be empty"
        
        print(f"  ✓ AI chat reply: {reply[:100]}...")
        
    except Exception as e:
        print(f"  ❌ AI chat return policy query FAILED: {e}")
        all_passed = False
    
    if all_passed:
        print("\n✅ AI chat test PASSED")
    else:
        print("\n❌ AI chat test FAILED")
    return all_passed

def test_ai_recommendations():
    """Test J) POST /api/ai/recommendations endpoint"""
    print("\n=== Testing AI Recommendations ===")
    all_passed = True
    
    # Test 1: With recent IDs
    try:
        print("\n  Testing AI recommendations with recentIds")
        rec_data = {
            "recentIds": ["0005", "0006"],
            "cartIds": [],
            "wishlistIds": []
        }
        
        response = requests.post(f"{BASE_URL}/ai/recommendations", json=rec_data, headers={"Content-Type": "application/json"})
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        assert 'reason' in data, "Expected 'reason' in response"
        
        items = data['items']
        reason = data['reason']
        
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 1 and len(items) <= 6, f"Expected 1-6 items, got {len(items)}"
        assert isinstance(reason, str), "reason should be a string"
        
        # Verify each item has id and price
        for item in items:
            assert 'id' in item, "Item missing 'id'"
            assert 'price' in item, "Item missing 'price'"
        
        print(f"  ✓ Recommendations: {len(items)} items, reason: {reason[:50]}...")
        
    except Exception as e:
        print(f"  ❌ AI recommendations with recentIds FAILED: {e}")
        all_passed = False
    
    # Test 2: With empty arrays
    try:
        print("\n  Testing AI recommendations with empty arrays")
        rec_data = {
            "recentIds": [],
            "cartIds": [],
            "wishlistIds": []
        }
        
        response = requests.post(f"{BASE_URL}/ai/recommendations", json=rec_data, headers={"Content-Type": "application/json"})
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert isinstance(items, list), "items should be an array"
        assert len(items) >= 1 and len(items) <= 6, f"Expected 1-6 items, got {len(items)}"
        
        print(f"  ✓ Recommendations with empty arrays: {len(items)} items")
        
    except Exception as e:
        print(f"  ❌ AI recommendations with empty arrays FAILED: {e}")
        all_passed = False
    
    if all_passed:
        print("\n✅ AI recommendations test PASSED")
    else:
        print("\n❌ AI recommendations test FAILED")
    return all_passed

def test_regression():
    """Test K) Regression checks"""
    print("\n=== Testing Regression Checks ===")
    all_passed = True
    
    # Test 1: GET /api/products?limit=5
    try:
        print("\n  Testing GET /api/products?limit=5")
        response = requests.get(f"{BASE_URL}/products?limit=5")
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        assert len(items) == 5, f"Expected exactly 5 items, got {len(items)}"
        
        print(f"  ✓ Products listing: {len(items)} items returned")
        
    except Exception as e:
        print(f"  ❌ Products listing regression FAILED: {e}")
        all_passed = False
    
    # Test 2: GET /api/products/0001
    try:
        print("\n  Testing GET /api/products/0001")
        response = requests.get(f"{BASE_URL}/products/0001")
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'id' in data, "Expected 'id' in response"
        assert data['id'] == '0001', f"Expected id='0001', got {data.get('id')}"
        assert 'name' in data, "Expected 'name' in response"
        
        print(f"  ✓ Product detail: {data.get('name', 'N/A')}")
        
    except Exception as e:
        print(f"  ❌ Product detail regression FAILED: {e}")
        all_passed = False
    
    if all_passed:
        print("\n✅ Regression checks PASSED")
    else:
        print("\n❌ Regression checks FAILED")
    return all_passed

def main():
    """Run all Phase 2 backend tests"""
    print("=" * 80)
    print("ZAMY MARKETPLACE PHASE 2 BACKEND API TESTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    
    results = {}
    
    # Run all Phase 2 tests
    results['A) Order Tracking'] = test_track_order()
    results['B) Admin Analytics'] = test_admin_analytics()
    results['C) Admin Orders'] = test_admin_orders()
    results['D) Admin Customers'] = test_admin_customers()
    results['E) Admin Coupons'] = test_admin_coupons()
    results['F) Admin Reviews'] = test_admin_reviews()
    results['G) Seller Analytics'] = test_seller_analytics()
    results['H) Seller Orders'] = test_seller_orders()
    results['I) AI Chat'] = test_ai_chat()
    results['J) AI Recommendations'] = test_ai_recommendations()
    results['K) Regression Checks'] = test_regression()
    
    # Summary
    print("\n" + "=" * 80)
    print("PHASE 2 TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print("=" * 80)
    print(f"Total: {passed}/{total} Phase 2 tests passed")
    print("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
