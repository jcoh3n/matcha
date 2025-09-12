# JSON Contract Documentation

This document defines the JSON contracts between the frontend and backend for authentication endpoints.

## Register Endpoint

### Request
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "password": "string"
}
```

### Response (Success - 201 Created)
```json
{
  "user": {
    "id": "number",
    "email": "string",
    "username": "string",
    "createdAt": "ISO 8601 datetime"
  },
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

### Response (Error - 409 Conflict)
```json
{
  "message": "string"
}
```

## Login Endpoint

### Request
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Response (Success - 200 OK)
```json
{
  "user": {
    "id": "number",
    "email": "string",
    "username": "string",
    "createdAt": "ISO 8601 datetime"
  },
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

### Response (Error - 401 Unauthorized)
```json
{
  "message": "string"
}
```

## Logout Endpoint

### Request
```
POST /api/auth/logout
Authorization: Bearer <accessToken>

(empty body)
```

### Response (Success - 200 OK)
```json
{
  "message": "string"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

## Refresh Token Endpoint

### Request
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### Response (Success - 200 OK)
```json
{
  "accessToken": "string (JWT)"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

### Response (Error - 401 Unauthorized)
```json
{
  "message": "string"
}
```

## Verify Email Endpoint

### Request
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "string"
}
```

### Response (Success - 200 OK)
```json
{
  "message": "string"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

## Forgot Password Endpoint

### Request
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "string"
}
```

### Response (Success - 200 OK)
```json
{
  "message": "string"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}
```

## Reset Password Endpoint

### Request
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "string",
  "newPassword": "string"
}
```

### Response (Success - 200 OK)
```json
{
  "message": "string"
}
```

### Response (Error - 400 Bad Request)
```json
{
  "message": "string"
}