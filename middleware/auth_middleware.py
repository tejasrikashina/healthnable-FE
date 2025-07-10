from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from typing import Callable, Dict, Any

from config import settings

async def auth_middleware(request: Request, call_next: Callable) -> Any:
    """
    Middleware to verify JWT tokens and handle authentication errors
    """
    # Public paths that don't require authentication
    public_paths = [
        "/",
        "/health",
        "/api/auth/token",
        "/api/auth/login",
        "/docs",
        "/openapi.json",
        "/redoc"
    ]
    
    if request.url.path in public_paths:
        # Skip auth for public paths
        return await call_next(request)
    
    # Check for Authorization header
    authorization = request.headers.get("Authorization")
    
    if not authorization:
        # No auth header, proceed to route handler for proper 401 response
        return await call_next(request)
    
    # Validate token format
    parts = authorization.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid authorization header format"},
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = parts[1]
    
    try:
        # Verify token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        
        if username is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid token"},
                headers={"WWW-Authenticate": "Bearer"}
            )
    
    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token or token expired"},
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Continue with the request
    return await call_next(request)
