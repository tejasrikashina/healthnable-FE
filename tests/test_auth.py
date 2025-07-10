from fastapi.testclient import TestClient

def test_login(client, test_caregiver):
    """Test successful login with valid credentials"""
    response = client.post(
        "/api/auth/login",
        json={
            "username": "caregiver",
            "password": "Caregiver123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert "user_id" in data
    assert "username" in data
    assert data["username"] == "caregiver"
    assert "role" in data
    assert data["role"] == "caregiver"

def test_login_invalid_credentials(client, test_caregiver):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/auth/login",
        json={
            "username": "caregiver",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_token_endpoint(client, test_caregiver):
    """Test token endpoint with valid credentials"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "caregiver",
            "password": "Caregiver123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_token_endpoint_invalid_credentials(client, test_caregiver):
    """Test token endpoint with invalid credentials"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "caregiver",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401

def test_change_password(client, caregiver_token, test_caregiver):
    """Test password change with valid current password"""
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "Caregiver123!",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        },
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 200
    
    # Verify we can login with new password
    response = client.post(
        "/api/auth/login",
        json={
            "username": "caregiver",
            "password": "NewPassword123!"
        }
    )
    assert response.status_code == 200

def test_change_password_wrong_current(client, caregiver_token, test_caregiver):
    """Test password change with invalid current password"""
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "WrongPassword",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        },
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 400

def test_change_password_mismatch(client, caregiver_token, test_caregiver):
    """Test password change with mismatched new/confirm passwords"""
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "Caregiver123!",
            "new_password": "NewPassword123!",
            "confirm_password": "DifferentPassword123!"
        },
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 422  # Validation error

def test_change_password_weak(client, caregiver_token, test_caregiver):
    """Test password change with weak new password"""
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "Caregiver123!",
            "new_password": "weak",
            "confirm_password": "weak"
        },
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 422  # Validation error

def test_protected_endpoint_no_token(client):
    """Test accessing protected endpoint without token"""
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_protected_endpoint_with_token(client, caregiver_token):
    """Test accessing protected endpoint with valid token"""
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "caregiver"
    assert data["role"] == "caregiver"

def test_logout(client, caregiver_token):
    """Test logout endpoint"""
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {caregiver_token}"}
    )
    assert response.status_code == 200
    assert "message" in response.json()
