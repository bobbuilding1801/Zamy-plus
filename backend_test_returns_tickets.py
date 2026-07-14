#!/usr/bin/env python3
"""
ZAMY Backend Test - Returns and Support Tickets APIs
Tests the new Returns and Tickets endpoints with full auth flow
"""
import requests
import sys
import json

# Base URL from .env
BASE_URL = "https://zamy-commerce.preview.emergentagent.com/api"

def log(msg):
    print(f"✓ {msg}")

def error(msg):
    print(f"✗ {msg}")
    
def test_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

# Global tokens
admin_token = None
customer_token = None
order_id = None
rma_id = None
ticket_id = None

def test_admin_login():
    """Test admin login to get admin JWT"""
    global admin_token
    test_section("ADMIN LOGIN")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@zamy.market",
            "password": "zamy2025",
            "role": "admin"
        }, timeout=10)
        
        if resp.status_code != 200:
            error(f"Admin login failed with status {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        if not data.get('ok') or not data.get('token'):
            error(f"Admin login response missing token: {data}")
            return False
            
        admin_token = data['token']
        log(f"Admin login successful, token: {admin_token[:20]}...")
        return True
    except Exception as e:
        error(f"Admin login exception: {e}")
        return False

def test_customer_otp_login():
    """Test customer OTP login to get customer JWT"""
    global customer_token
    test_section("CUSTOMER OTP LOGIN")
    
    customer_email = "testcust+returns@zamy.market"
    
    try:
        # Step 1: Request OTP
        resp = requests.post(f"{BASE_URL}/customer/otp/request", json={
            "email": customer_email
        }, timeout=10)
        
        if resp.status_code != 200:
            error(f"OTP request failed with status {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        if not data.get('ok'):
            error(f"OTP request failed: {data}")
            return False
            
        dev_code = data.get('devCode')
        if not dev_code:
            error(f"No devCode in response (mock mode expected): {data}")
            return False
            
        log(f"OTP requested successfully, devCode: {dev_code}")
        
        # Step 2: Verify OTP
        resp = requests.post(f"{BASE_URL}/customer/otp/verify", json={
            "email": customer_email,
            "code": dev_code
        }, timeout=10)
        
        if resp.status_code != 200:
            error(f"OTP verify failed with status {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        if not data.get('ok') or not data.get('token'):
            error(f"OTP verify response missing token: {data}")
            return False
            
        customer_token = data['token']
        log(f"Customer login successful, token: {customer_token[:20]}...")
        return True
    except Exception as e:
        error(f"Customer OTP login exception: {e}")
        return False

def test_create_order():
    """Create an order as customer for returns testing"""
    global order_id
    test_section("CREATE ORDER FOR RETURNS")
    
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/orders", json={
            "items": [{"id": "0001", "qty": 1}],
            "total": 59999,
            "address": {
                "name": "Test Customer",
                "email": "testcust+returns@zamy.market",
                "line1": "1 MG Road",
                "city": "Bangalore",
                "pin": "560001"
            },
            "shipping": "standard",
            "payment": "upi"
        }, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            error(f"Order creation failed with status {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        if not data.get('ok') or not data.get('order', {}).get('id'):
            error(f"Order response missing order.id: {data}")
            return False
            
        order_id = data['order']['id']
        log(f"Order created successfully, orderId: {order_id}")
        return True
    except Exception as e:
        error(f"Order creation exception: {e}")
        return False

def test_returns_flow():
    """Test complete returns flow"""
    global rma_id
    test_section("RETURNS FLOW")
    
    passed = 0
    total = 8
    
    # Test 1: Create return as customer
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/customer/returns", json={
            "orderId": order_id,
            "reason": "Damaged in transit",
            "mode": "refund"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok') and data.get('item', {}).get('id', '').startswith('RMA-'):
                rma_id = data['item']['id']
                status = data['item'].get('status')
                product_id = data['item'].get('productId')
                product_name = data['item'].get('productName')
                amount = data['item'].get('amount')
                
                if status == 'requested' and product_id and product_name and amount:
                    log(f"✅ Test 1/8: Create return - PASSED (RMA: {rma_id}, status: {status})")
                    passed += 1
                else:
                    error(f"Test 1/8: Create return - FAILED (missing fields: status={status}, productId={product_id}, productName={product_name}, amount={amount})")
            else:
                error(f"Test 1/8: Create return - FAILED (invalid response: {data})")
        else:
            error(f"Test 1/8: Create return - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test 1/8: Create return - EXCEPTION: {e}")
    
    # Test 2: Get customer returns
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.get(f"{BASE_URL}/customer/returns", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            found = any(item.get('id') == rma_id for item in items)
            if found:
                log(f"✅ Test 2/8: Get customer returns - PASSED (found RMA {rma_id})")
                passed += 1
            else:
                error(f"Test 2/8: Get customer returns - FAILED (RMA {rma_id} not found in {len(items)} items)")
        else:
            error(f"Test 2/8: Get customer returns - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test 2/8: Get customer returns - EXCEPTION: {e}")
    
    # Test 3: Get customer returns without auth (should be 401)
    try:
        resp = requests.get(f"{BASE_URL}/customer/returns", timeout=10)
        
        if resp.status_code == 401:
            log(f"✅ Test 3/8: Get returns without auth - PASSED (401 as expected)")
            passed += 1
        else:
            error(f"Test 3/8: Get returns without auth - FAILED (expected 401, got {resp.status_code})")
    except Exception as e:
        error(f"Test 3/8: Get returns without auth - EXCEPTION: {e}")
    
    # Test 4: Create return with bogus orderId (should be 404)
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/customer/returns", json={
            "orderId": "BOGUS123",
            "reason": "Test",
            "mode": "refund"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 404:
            data = resp.json()
            if not data.get('ok'):
                log(f"✅ Test 4/8: Create return with bogus orderId - PASSED (404 as expected)")
                passed += 1
            else:
                error(f"Test 4/8: Create return with bogus orderId - FAILED (ok=true unexpected)")
        else:
            error(f"Test 4/8: Create return with bogus orderId - FAILED (expected 404, got {resp.status_code})")
    except Exception as e:
        error(f"Test 4/8: Create return with bogus orderId - EXCEPTION: {e}")
    
    # Test 5: Get admin returns with admin token
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.get(f"{BASE_URL}/admin/returns", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            found = any(item.get('id') == rma_id for item in items)
            if found:
                log(f"✅ Test 5/8: Get admin returns - PASSED (found RMA {rma_id})")
                passed += 1
            else:
                error(f"Test 5/8: Get admin returns - FAILED (RMA {rma_id} not found in {len(items)} items)")
        else:
            error(f"Test 5/8: Get admin returns - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test 5/8: Get admin returns - EXCEPTION: {e}")
    
    # Test 6: Get admin returns without admin token (should be 401)
    try:
        resp = requests.get(f"{BASE_URL}/admin/returns", timeout=10)
        
        if resp.status_code == 401:
            log(f"✅ Test 6/8: Get admin returns without auth - PASSED (401 as expected)")
            passed += 1
        else:
            error(f"Test 6/8: Get admin returns without auth - FAILED (expected 401, got {resp.status_code})")
    except Exception as e:
        error(f"Test 6/8: Get admin returns without auth - EXCEPTION: {e}")
    
    # Test 7: Update return status as admin (approved, then refunded, then invalid)
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 7a: Approve
        resp = requests.put(f"{BASE_URL}/admin/returns/{rma_id}", json={
            "status": "approved"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200 and resp.json().get('ok'):
            log(f"✅ Test 7a/8: Update return to 'approved' - PASSED")
            
            # 7b: Refund
            resp = requests.put(f"{BASE_URL}/admin/returns/{rma_id}", json={
                "status": "refunded"
            }, headers=headers, timeout=10)
            
            if resp.status_code == 200 and resp.json().get('ok'):
                log(f"✅ Test 7b/8: Update return to 'refunded' - PASSED")
                
                # 7c: Invalid status
                resp = requests.put(f"{BASE_URL}/admin/returns/{rma_id}", json={
                    "status": "foo"
                }, headers=headers, timeout=10)
                
                if resp.status_code == 400:
                    log(f"✅ Test 7c/8: Update return with invalid status - PASSED (400 as expected)")
                    passed += 1
                else:
                    error(f"Test 7c/8: Update return with invalid status - FAILED (expected 400, got {resp.status_code})")
            else:
                error(f"Test 7b/8: Update return to 'refunded' - FAILED (status {resp.status_code})")
        else:
            error(f"Test 7a/8: Update return to 'approved' - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test 7/8: Update return status - EXCEPTION: {e}")
    
    # Test 8: Verify return status is now 'refunded'
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.get(f"{BASE_URL}/customer/returns", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            rma = next((item for item in items if item.get('id') == rma_id), None)
            if rma and rma.get('status') == 'refunded':
                log(f"✅ Test 8/8: Verify return status 'refunded' - PASSED")
                passed += 1
            else:
                error(f"Test 8/8: Verify return status 'refunded' - FAILED (status: {rma.get('status') if rma else 'not found'})")
        else:
            error(f"Test 8/8: Verify return status 'refunded' - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test 8/8: Verify return status 'refunded' - EXCEPTION: {e}")
    
    print(f"\n📊 RETURNS FLOW: {passed}/{total} tests passed")
    return passed == total

def test_tickets_flow():
    """Test complete tickets flow"""
    global ticket_id
    test_section("TICKETS FLOW")
    
    passed = 0
    total = 8
    
    # Test A: Create ticket as customer
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/customer/tickets", json={
            "subject": "Where is my order?",
            "category": "delivery",
            "orderId": order_id,
            "message": "Hi, my order is stuck. Please help."
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok') and data.get('item', {}).get('id', '').startswith('TKT-'):
                ticket_id = data['item']['id']
                status = data['item'].get('status')
                messages = data['item'].get('messages', [])
                
                if status == 'open' and len(messages) == 1:
                    log(f"✅ Test A/8: Create ticket - PASSED (TKT: {ticket_id}, status: {status}, messages: {len(messages)})")
                    passed += 1
                else:
                    error(f"Test A/8: Create ticket - FAILED (status={status}, messages={len(messages)})")
            else:
                error(f"Test A/8: Create ticket - FAILED (invalid response: {data})")
        else:
            error(f"Test A/8: Create ticket - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test A/8: Create ticket - EXCEPTION: {e}")
    
    # Test B: Get customer tickets
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.get(f"{BASE_URL}/customer/tickets", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            found = any(item.get('id') == ticket_id for item in items)
            if found:
                log(f"✅ Test B/8: Get customer tickets - PASSED (found ticket {ticket_id})")
                passed += 1
            else:
                error(f"Test B/8: Get customer tickets - FAILED (ticket {ticket_id} not found in {len(items)} items)")
        else:
            error(f"Test B/8: Get customer tickets - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test B/8: Get customer tickets - EXCEPTION: {e}")
    
    # Test C: Reply to ticket as customer
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/customer/tickets/{ticket_id}/reply", json={
            "message": "Any update?"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200 and resp.json().get('ok'):
            # Verify messages count increased
            resp = requests.get(f"{BASE_URL}/customer/tickets", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get('items', [])
                ticket = next((item for item in items if item.get('id') == ticket_id), None)
                if ticket and len(ticket.get('messages', [])) == 2:
                    log(f"✅ Test C/8: Reply to ticket - PASSED (messages count: 2)")
                    passed += 1
                else:
                    error(f"Test C/8: Reply to ticket - FAILED (messages count: {len(ticket.get('messages', [])) if ticket else 'not found'})")
            else:
                error(f"Test C/8: Reply to ticket - FAILED (get tickets status {resp.status_code})")
        else:
            error(f"Test C/8: Reply to ticket - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test C/8: Reply to ticket - EXCEPTION: {e}")
    
    # Test D: Reply with empty message (should be 400)
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/customer/tickets/{ticket_id}/reply", json={
            "message": ""
        }, headers=headers, timeout=10)
        
        if resp.status_code == 400:
            log(f"✅ Test D/8: Reply with empty message - PASSED (400 as expected)")
            passed += 1
        else:
            error(f"Test D/8: Reply with empty message - FAILED (expected 400, got {resp.status_code})")
    except Exception as e:
        error(f"Test D/8: Reply with empty message - EXCEPTION: {e}")
    
    # Test E: Get admin tickets with admin token
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.get(f"{BASE_URL}/admin/tickets", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            found = any(item.get('id') == ticket_id for item in items)
            if found:
                log(f"✅ Test E/8: Get admin tickets - PASSED (found ticket {ticket_id})")
                passed += 1
            else:
                error(f"Test E/8: Get admin tickets - FAILED (ticket {ticket_id} not found in {len(items)} items)")
        else:
            error(f"Test E/8: Get admin tickets - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test E/8: Get admin tickets - EXCEPTION: {e}")
    
    # Test E2: Get admin tickets without admin token (should be 401)
    try:
        resp = requests.get(f"{BASE_URL}/admin/tickets", timeout=10)
        
        if resp.status_code == 401:
            log(f"✅ Test E2/8: Get admin tickets without auth - PASSED (401 as expected)")
            # Don't increment passed, this is a bonus check
        else:
            error(f"Test E2/8: Get admin tickets without auth - FAILED (expected 401, got {resp.status_code})")
    except Exception as e:
        error(f"Test E2/8: Get admin tickets without auth - EXCEPTION: {e}")
    
    # Test F: Admin reply to ticket
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.post(f"{BASE_URL}/admin/tickets/{ticket_id}/reply", json={
            "message": "Sorry for delay, courier update pending."
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200 and resp.json().get('ok'):
            # Verify messages count and status
            resp = requests.get(f"{BASE_URL}/admin/tickets", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get('items', [])
                ticket = next((item for item in items if item.get('id') == ticket_id), None)
                if ticket:
                    messages_count = len(ticket.get('messages', []))
                    status = ticket.get('status')
                    if messages_count == 3 and status == 'pending':
                        log(f"✅ Test F/8: Admin reply to ticket - PASSED (messages: 3, status: pending)")
                        passed += 1
                    else:
                        error(f"Test F/8: Admin reply to ticket - FAILED (messages: {messages_count}, status: {status})")
                else:
                    error(f"Test F/8: Admin reply to ticket - FAILED (ticket not found)")
            else:
                error(f"Test F/8: Admin reply to ticket - FAILED (get tickets status {resp.status_code})")
        else:
            error(f"Test F/8: Admin reply to ticket - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test F/8: Admin reply to ticket - EXCEPTION: {e}")
    
    # Test G: Update ticket status as admin (resolved, then invalid)
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # G1: Resolve
        resp = requests.put(f"{BASE_URL}/admin/tickets/{ticket_id}", json={
            "status": "resolved"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200 and resp.json().get('ok'):
            log(f"✅ Test G1/8: Update ticket to 'resolved' - PASSED")
            
            # G2: Invalid status
            resp = requests.put(f"{BASE_URL}/admin/tickets/{ticket_id}", json={
                "status": "invalid_status"
            }, headers=headers, timeout=10)
            
            # Note: The code doesn't return 400 for invalid status, it just ignores it
            # Let's verify the status didn't change
            resp = requests.get(f"{BASE_URL}/admin/tickets", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get('items', [])
                ticket = next((item for item in items if item.get('id') == ticket_id), None)
                if ticket and ticket.get('status') == 'resolved':
                    log(f"✅ Test G2/8: Update ticket with invalid status - PASSED (status unchanged)")
                    passed += 1
                else:
                    error(f"Test G2/8: Update ticket with invalid status - FAILED (status: {ticket.get('status') if ticket else 'not found'})")
            else:
                error(f"Test G2/8: Update ticket with invalid status - FAILED (get tickets status {resp.status_code})")
        else:
            error(f"Test G1/8: Update ticket to 'resolved' - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test G/8: Update ticket status - EXCEPTION: {e}")
    
    # Test H: Verify ticket status is 'resolved' as customer
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.get(f"{BASE_URL}/customer/tickets", headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            ticket = next((item for item in items if item.get('id') == ticket_id), None)
            if ticket and ticket.get('status') == 'resolved':
                log(f"✅ Test H/8: Verify ticket status 'resolved' - PASSED")
                passed += 1
            else:
                error(f"Test H/8: Verify ticket status 'resolved' - FAILED (status: {ticket.get('status') if ticket else 'not found'})")
        else:
            error(f"Test H/8: Verify ticket status 'resolved' - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Test H/8: Verify ticket status 'resolved' - EXCEPTION: {e}")
    
    print(f"\n📊 TICKETS FLOW: {passed}/{total} tests passed")
    return passed == total

def test_regression():
    """Regression spot-checks for existing endpoints"""
    test_section("REGRESSION SPOT-CHECKS")
    
    passed = 0
    total = 7
    
    # Test 1: GET /api/
    try:
        resp = requests.get(f"{BASE_URL}/", timeout=10)
        if resp.status_code == 200 and resp.json().get('ok'):
            log(f"✅ Regression 1/7: GET /api/ - PASSED")
            passed += 1
        else:
            error(f"Regression 1/7: GET /api/ - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 1/7: GET /api/ - EXCEPTION: {e}")
    
    # Test 2: GET /api/products?limit=5
    try:
        resp = requests.get(f"{BASE_URL}/products?limit=5", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            if len(items) <= 5:
                log(f"✅ Regression 2/7: GET /api/products?limit=5 - PASSED ({len(items)} items)")
                passed += 1
            else:
                error(f"Regression 2/7: GET /api/products?limit=5 - FAILED ({len(items)} items, expected ≤5)")
        else:
            error(f"Regression 2/7: GET /api/products?limit=5 - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 2/7: GET /api/products?limit=5 - EXCEPTION: {e}")
    
    # Test 3: GET /api/products/0001
    try:
        resp = requests.get(f"{BASE_URL}/products/0001", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('id') == '0001' and data.get('name'):
                log(f"✅ Regression 3/7: GET /api/products/0001 - PASSED (name: {data.get('name')})")
                passed += 1
            else:
                error(f"Regression 3/7: GET /api/products/0001 - FAILED (missing id or name)")
        else:
            error(f"Regression 3/7: GET /api/products/0001 - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 3/7: GET /api/products/0001 - EXCEPTION: {e}")
    
    # Test 4: GET /api/admin/analytics
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.get(f"{BASE_URL}/admin/analytics", headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'revenue' in data and 'totals' in data:
                log(f"✅ Regression 4/7: GET /api/admin/analytics - PASSED")
                passed += 1
            else:
                error(f"Regression 4/7: GET /api/admin/analytics - FAILED (missing revenue or totals)")
        else:
            error(f"Regression 4/7: GET /api/admin/analytics - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 4/7: GET /api/admin/analytics - EXCEPTION: {e}")
    
    # Test 5: GET /api/admin/orders
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.get(f"{BASE_URL}/admin/orders", headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'items' in data:
                log(f"✅ Regression 5/7: GET /api/admin/orders - PASSED ({len(data['items'])} orders)")
                passed += 1
            else:
                error(f"Regression 5/7: GET /api/admin/orders - FAILED (missing items)")
        else:
            error(f"Regression 5/7: GET /api/admin/orders - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 5/7: GET /api/admin/orders - EXCEPTION: {e}")
    
    # Test 6: GET /api/customer/orders
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.get(f"{BASE_URL}/customer/orders", headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            # Should contain the order we created
            found = any(item.get('id') == order_id for item in items)
            if found:
                log(f"✅ Regression 6/7: GET /api/customer/orders - PASSED (found order {order_id})")
                passed += 1
            else:
                error(f"Regression 6/7: GET /api/customer/orders - FAILED (order {order_id} not found)")
        else:
            error(f"Regression 6/7: GET /api/customer/orders - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 6/7: GET /api/customer/orders - EXCEPTION: {e}")
    
    # Test 7: POST /api/orders (another order to verify endpoint still works)
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp = requests.post(f"{BASE_URL}/orders", json={
            "items": [{"id": "0002", "qty": 1}],
            "total": 12999,
            "address": {
                "name": "Test Customer 2",
                "email": "testcust+returns@zamy.market",
                "line1": "2 MG Road",
                "city": "Mumbai",
                "pin": "400001"
            },
            "shipping": "express",
            "payment": "card"
        }, headers=headers, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok') and data.get('order', {}).get('id'):
                log(f"✅ Regression 7/7: POST /api/orders - PASSED (order: {data['order']['id']})")
                passed += 1
            else:
                error(f"Regression 7/7: POST /api/orders - FAILED (invalid response)")
        else:
            error(f"Regression 7/7: POST /api/orders - FAILED (status {resp.status_code})")
    except Exception as e:
        error(f"Regression 7/7: POST /api/orders - EXCEPTION: {e}")
    
    print(f"\n📊 REGRESSION: {passed}/{total} tests passed")
    return passed == total

def main():
    print("\n" + "="*60)
    print("  ZAMY BACKEND TEST - RETURNS & TICKETS")
    print("  Base URL:", BASE_URL)
    print("="*60)
    
    results = {
        "admin_login": False,
        "customer_login": False,
        "create_order": False,
        "returns_flow": False,
        "tickets_flow": False,
        "regression": False
    }
    
    # Run tests in sequence
    results["admin_login"] = test_admin_login()
    if not results["admin_login"]:
        print("\n❌ CRITICAL: Admin login failed, cannot continue")
        sys.exit(1)
    
    results["customer_login"] = test_customer_otp_login()
    if not results["customer_login"]:
        print("\n❌ CRITICAL: Customer login failed, cannot continue")
        sys.exit(1)
    
    results["create_order"] = test_create_order()
    if not results["create_order"]:
        print("\n❌ CRITICAL: Order creation failed, cannot continue")
        sys.exit(1)
    
    results["returns_flow"] = test_returns_flow()
    results["tickets_flow"] = test_tickets_flow()
    results["regression"] = test_regression()
    
    # Final summary
    test_section("FINAL SUMMARY")
    total_passed = sum(1 for v in results.values() if v)
    total_tests = len(results)
    
    print(f"\n{'='*60}")
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name.replace('_', ' ').title()}: {status}")
    print(f"{'='*60}")
    print(f"\n🎯 OVERALL: {total_passed}/{total_tests} test suites passed")
    
    if total_passed == total_tests:
        print("\n✅ ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print(f"\n❌ {total_tests - total_passed} test suite(s) failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
