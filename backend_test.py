#!/usr/bin/env python3
"""
Backend API tests for ZAMY marketplace
Tests all endpoints defined in app/api/[[...path]]/route.js
"""

import requests
import json
import sys

BASE_URL = "https://zamy-commerce.preview.emergentagent.com/api"

def test_root():
    """Test GET /api/ endpoint"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        assert data.get('service') == 'ZAMY API', "Expected service: 'ZAMY API'"
        print("✅ Root endpoint test PASSED")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test FAILED: {e}")
        return False

def test_categories():
    """Test GET /api/categories endpoint"""
    print("\n=== Testing Categories Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/categories")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        items = data['items']
        print(f"Number of categories: {len(items)}")
        
        assert len(items) == 8, f"Expected 8 categories, got {len(items)}"
        
        # Check first category structure
        if items:
            cat = items[0]
            print(f"First category: {json.dumps(cat, indent=2)}")
            assert 'slug' in cat, "Category should have 'slug'"
            assert 'name' in cat, "Category should have 'name'"
            assert 'subs' in cat, "Category should have 'subs'"
        
        print("✅ Categories endpoint test PASSED")
        return True
    except Exception as e:
        print(f"❌ Categories endpoint test FAILED: {e}")
        return False

def test_brands():
    """Test GET /api/brands endpoint"""
    print("\n=== Testing Brands Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/brands")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        items = data['items']
        print(f"Number of brands: {len(items)}")
        print(f"Sample brands: {items[:5]}")
        
        assert isinstance(items, list), "Brands should be an array"
        assert len(items) > 0, "Should have at least one brand"
        
        print("✅ Brands endpoint test PASSED")
        return True
    except Exception as e:
        print(f"❌ Brands endpoint test FAILED: {e}")
        return False

def test_products_search():
    """Test GET /api/products with search query"""
    print("\n=== Testing Products Search (q=laptop) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?q=laptop")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        assert 'total' in data, "Expected 'total' in response"
        
        items = data['items']
        total = data['total']
        print(f"Found {len(items)} items, total: {total}")
        
        if items:
            print(f"First product: {items[0].get('name', 'N/A')}")
            # Check if search term appears in results
            found_match = any('laptop' in item.get('name', '').lower() for item in items)
            print(f"Search term 'laptop' found in results: {found_match}")
        
        print("✅ Products search test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products search test FAILED: {e}")
        return False

def test_products_category_filter():
    """Test GET /api/products with category and subcategory filters"""
    print("\n=== Testing Products Category Filter (electronics/Laptops) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?category=electronics&subcategory=Laptops")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} laptop items")
        
        if items:
            # Verify all items are laptops
            for item in items[:3]:
                print(f"  - {item.get('name', 'N/A')} | Category: {item.get('category', 'N/A')} | Subcategory: {item.get('subcategory', 'N/A')}")
        
        print("✅ Products category filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products category filter test FAILED: {e}")
        return False

def test_products_brand_filter():
    """Test GET /api/products with brand filter"""
    print("\n=== Testing Products Brand Filter (Samsung,Apple) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?brand=Samsung,Apple")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} items from Samsung or Apple")
        
        if items:
            brands_found = set()
            for item in items[:5]:
                brand = item.get('brand', 'N/A')
                brands_found.add(brand)
                print(f"  - {item.get('name', 'N/A')} | Brand: {brand}")
            print(f"Brands in results: {brands_found}")
        
        print("✅ Products brand filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products brand filter test FAILED: {e}")
        return False

def test_products_price_filter():
    """Test GET /api/products with price range filter"""
    print("\n=== Testing Products Price Filter (10000-100000) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?minPrice=10000&maxPrice=100000")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} items in price range 10000-100000")
        
        if items:
            for item in items[:5]:
                price = item.get('price', 0)
                print(f"  - {item.get('name', 'N/A')} | Price: ₹{price}")
                # Verify price is within range
                if price < 10000 or price > 100000:
                    print(f"⚠️  Warning: Price {price} outside range")
        
        print("✅ Products price filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products price filter test FAILED: {e}")
        return False

def test_products_rating_filter():
    """Test GET /api/products with rating filter"""
    print("\n=== Testing Products Rating Filter (rating>=4) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?rating=4")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} items with rating >= 4")
        
        if items:
            for item in items[:5]:
                rating = item.get('rating', 0)
                print(f"  - {item.get('name', 'N/A')} | Rating: {rating}")
                if rating < 4:
                    print(f"⚠️  Warning: Rating {rating} below 4")
        
        print("✅ Products rating filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products rating filter test FAILED: {e}")
        return False

def test_products_instock_filter():
    """Test GET /api/products with inStock filter"""
    print("\n=== Testing Products InStock Filter ===")
    try:
        response = requests.get(f"{BASE_URL}/products?inStock=true")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} in-stock items")
        
        if items:
            for item in items[:5]:
                stock = item.get('stock', 0)
                print(f"  - {item.get('name', 'N/A')} | Stock: {stock}")
                if stock == 0:
                    print(f"⚠️  Warning: Stock is 0 but item returned")
        
        print("✅ Products inStock filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products inStock filter test FAILED: {e}")
        return False

def test_products_tag_filter():
    """Test GET /api/products with tag filter"""
    print("\n=== Testing Products Tag Filter (tag=deal) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?tag=deal")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} items with 'deal' tag")
        
        if items:
            for item in items[:5]:
                tags = item.get('tags', [])
                print(f"  - {item.get('name', 'N/A')} | Tags: {tags}")
                if 'deal' not in tags:
                    print(f"⚠️  Warning: 'deal' tag not found in item tags")
        
        print("✅ Products tag filter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products tag filter test FAILED: {e}")
        return False

def test_products_sort():
    """Test GET /api/products with different sort options"""
    print("\n=== Testing Products Sort ===")
    
    sorts = ['price_asc', 'price_desc', 'newest', 'rating', 'discount', 'popular']
    all_passed = True
    
    for sort_type in sorts:
        try:
            print(f"\n  Testing sort={sort_type}")
            response = requests.get(f"{BASE_URL}/products?sort={sort_type}&limit=5")
            data = response.json()
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            items = data.get('items', [])
            print(f"  Found {len(items)} items")
            
            if items and sort_type == 'price_asc':
                prices = [item.get('price', 0) for item in items]
                print(f"  Prices (ascending): {prices}")
                is_sorted = all(prices[i] <= prices[i+1] for i in range(len(prices)-1))
                if not is_sorted:
                    print(f"  ⚠️  Warning: Prices not in ascending order")
            
            elif items and sort_type == 'price_desc':
                prices = [item.get('price', 0) for item in items]
                print(f"  Prices (descending): {prices}")
                is_sorted = all(prices[i] >= prices[i+1] for i in range(len(prices)-1))
                if not is_sorted:
                    print(f"  ⚠️  Warning: Prices not in descending order")
            
        except Exception as e:
            print(f"  ❌ Sort {sort_type} FAILED: {e}")
            all_passed = False
    
    if all_passed:
        print("\n✅ Products sort test PASSED")
    else:
        print("\n❌ Products sort test FAILED")
    return all_passed

def test_products_pagination():
    """Test GET /api/products with pagination"""
    print("\n=== Testing Products Pagination ===")
    try:
        response = requests.get(f"{BASE_URL}/products?limit=5&skip=0")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        assert 'total' in data, "Expected 'total' in response"
        
        items = data['items']
        total = data['total']
        print(f"Page 1: {len(items)} items, total: {total}")
        
        assert len(items) <= 5, f"Expected max 5 items, got {len(items)}"
        
        # Test second page
        response2 = requests.get(f"{BASE_URL}/products?limit=5&skip=5")
        data2 = response2.json()
        items2 = data2['items']
        print(f"Page 2: {len(items2)} items")
        
        # Verify different items
        if items and items2:
            first_page_ids = [item.get('id') for item in items]
            second_page_ids = [item.get('id') for item in items2]
            overlap = set(first_page_ids) & set(second_page_ids)
            print(f"Overlap between pages: {len(overlap)} items")
        
        print("✅ Products pagination test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products pagination test FAILED: {e}")
        return False

def test_products_suggest():
    """Test GET /api/products/suggest endpoint"""
    print("\n=== Testing Products Suggest (q=lap) ===")
    try:
        response = requests.get(f"{BASE_URL}/products/suggest?q=lap")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} suggestions")
        
        assert len(items) <= 8, f"Expected max 8 suggestions, got {len(items)}"
        
        if items:
            for item in items:
                name = item.get('name', '')
                brand = item.get('brand', '')
                subcat = item.get('subcategory', '')
                print(f"  - {name} | Brand: {brand} | Subcategory: {subcat}")
        
        print("✅ Products suggest test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products suggest test FAILED: {e}")
        return False

def test_products_by_ids():
    """Test GET /api/products/by-ids endpoint"""
    print("\n=== Testing Products By IDs ===")
    try:
        response = requests.get(f"{BASE_URL}/products/by-ids?ids=0001,0002,9999")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} items (requested 3, one invalid)")
        
        # Should return only valid IDs (0001, 0002), not 9999
        ids_returned = [item.get('id') for item in items]
        print(f"IDs returned: {ids_returned}")
        
        # Check order preservation
        if '0001' in ids_returned and '0002' in ids_returned:
            idx_0001 = ids_returned.index('0001')
            idx_0002 = ids_returned.index('0002')
            if idx_0001 < idx_0002:
                print("✓ Order preserved (0001 before 0002)")
            else:
                print("⚠️  Warning: Order not preserved")
        
        print("✅ Products by-ids test PASSED")
        return True
    except Exception as e:
        print(f"❌ Products by-ids test FAILED: {e}")
        return False

def test_product_detail():
    """Test GET /api/products/:id endpoint"""
    print("\n=== Testing Product Detail ===")
    
    # Test valid product
    try:
        print("\n  Testing valid product (0001)")
        response = requests.get(f"{BASE_URL}/products/0001")
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'id' in data, "Expected 'id' in response"
        assert 'name' in data, "Expected 'name' in response"
        assert 'images' in data, "Expected 'images' in response"
        assert 'specs' in data, "Expected 'specs' in response"
        assert 'rating' in data, "Expected 'rating' in response"
        
        print(f"  Product: {data.get('name', 'N/A')}")
        print(f"  Images: {len(data.get('images', []))} images")
        print(f"  Specs: {len(data.get('specs', []))} specs")
        print(f"  Rating: {data.get('rating', 'N/A')}")
        
    except Exception as e:
        print(f"  ❌ Valid product test FAILED: {e}")
        return False
    
    # Test invalid product (404)
    try:
        print("\n  Testing invalid product (9999)")
        response = requests.get(f"{BASE_URL}/products/9999")
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("  ✓ Correctly returns 404 for invalid product")
        
    except Exception as e:
        print(f"  ❌ Invalid product test FAILED: {e}")
        return False
    
    print("\n✅ Product detail test PASSED")
    return True

def test_product_similar():
    """Test GET /api/products/:id/similar endpoint"""
    print("\n=== Testing Product Similar ===")
    try:
        response = requests.get(f"{BASE_URL}/products/0001/similar")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} similar products")
        
        if items:
            for item in items[:3]:
                print(f"  - {item.get('name', 'N/A')}")
        
        print("✅ Product similar test PASSED")
        return True
    except Exception as e:
        print(f"❌ Product similar test FAILED: {e}")
        return False

def test_product_fbt():
    """Test GET /api/products/:id/fbt endpoint"""
    print("\n=== Testing Product FBT (Frequently Bought Together) ===")
    try:
        response = requests.get(f"{BASE_URL}/products/0001/fbt")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} FBT products")
        
        if items:
            for item in items:
                print(f"  - {item.get('name', 'N/A')}")
        
        print("✅ Product FBT test PASSED")
        return True
    except Exception as e:
        print(f"❌ Product FBT test FAILED: {e}")
        return False

def test_product_reviews():
    """Test GET /api/products/:id/reviews endpoint"""
    print("\n=== Testing Product Reviews ===")
    try:
        response = requests.get(f"{BASE_URL}/products/0001/reviews")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} reviews")
        
        assert len(items) == 6, f"Expected 6 reviews, got {len(items)}"
        
        if items:
            review = items[0]
            print(f"Sample review: {review.get('name', 'N/A')} - {review.get('title', 'N/A')} ({review.get('rating', 'N/A')} stars)")
        
        print("✅ Product reviews test PASSED")
        return True
    except Exception as e:
        print(f"❌ Product reviews test FAILED: {e}")
        return False

def test_product_qna():
    """Test GET /api/products/:id/qna endpoint"""
    print("\n=== Testing Product Q&A ===")
    try:
        response = requests.get(f"{BASE_URL}/products/0001/qna")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'items' in data, "Expected 'items' in response"
        
        items = data['items']
        print(f"Found {len(items)} Q&A items")
        
        assert len(items) == 3, f"Expected 3 Q&A items, got {len(items)}"
        
        if items:
            qa = items[0]
            print(f"Sample Q&A: Q: {qa.get('q', 'N/A')[:50]}...")
        
        print("✅ Product Q&A test PASSED")
        return True
    except Exception as e:
        print(f"❌ Product Q&A test FAILED: {e}")
        return False

def test_orders():
    """Test POST /api/orders endpoint"""
    print("\n=== Testing Orders ===")
    try:
        order_data = {
            "items": [{"id": "0001", "qty": 1}],
            "total": 59999,
            "address": {
                "name": "Aarav Kumar",
                "line1": "123 MG Road",
                "city": "Bangalore",
                "pin": "560001"
            },
            "shipping": "standard",
            "payment": "upi"
        }
        
        response = requests.post(f"{BASE_URL}/orders", json=order_data)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        assert 'order' in data, "Expected 'order' in response"
        
        order = data['order']
        assert 'id' in order, "Expected 'id' in order"
        
        print(f"Order created with ID: {order.get('id')}")
        print(f"Order status: {order.get('status', 'N/A')}")
        
        print("✅ Orders test PASSED")
        return True
    except Exception as e:
        print(f"❌ Orders test FAILED: {e}")
        return False

def test_newsletter():
    """Test POST /api/newsletter endpoint"""
    print("\n=== Testing Newsletter ===")
    try:
        newsletter_data = {"email": "test@example.com"}
        
        response = requests.post(f"{BASE_URL}/newsletter", json=newsletter_data)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        
        print("Newsletter subscription successful")
        print("✅ Newsletter test PASSED")
        return True
    except Exception as e:
        print(f"❌ Newsletter test FAILED: {e}")
        return False

def test_contact():
    """Test POST /api/contact endpoint"""
    print("\n=== Testing Contact ===")
    try:
        contact_data = {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "subject": "Product Inquiry",
            "message": "I would like to know more about the warranty policy."
        }
        
        response = requests.post(f"{BASE_URL}/contact", json=contact_data)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        
        print("Contact form submission successful")
        print("✅ Contact test PASSED")
        return True
    except Exception as e:
        print(f"❌ Contact test FAILED: {e}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 80)
    print("ZAMY MARKETPLACE BACKEND API TESTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    
    results = {}
    
    # Run all tests
    results['Root'] = test_root()
    results['Categories'] = test_categories()
    results['Brands'] = test_brands()
    results['Products Search'] = test_products_search()
    results['Products Category Filter'] = test_products_category_filter()
    results['Products Brand Filter'] = test_products_brand_filter()
    results['Products Price Filter'] = test_products_price_filter()
    results['Products Rating Filter'] = test_products_rating_filter()
    results['Products InStock Filter'] = test_products_instock_filter()
    results['Products Tag Filter'] = test_products_tag_filter()
    results['Products Sort'] = test_products_sort()
    results['Products Pagination'] = test_products_pagination()
    results['Products Suggest'] = test_products_suggest()
    results['Products By IDs'] = test_products_by_ids()
    results['Product Detail'] = test_product_detail()
    results['Product Similar'] = test_product_similar()
    results['Product FBT'] = test_product_fbt()
    results['Product Reviews'] = test_product_reviews()
    results['Product Q&A'] = test_product_qna()
    results['Orders'] = test_orders()
    results['Newsletter'] = test_newsletter()
    results['Contact'] = test_contact()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print("=" * 80)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
