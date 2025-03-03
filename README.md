# TODO API - EFFECT TS

This is a simple TODO API built with Effect TS. It provides endpoints for user authentication and managing TODO items.

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <repository_url>
cd <repository_directory>
```

### 2️⃣ Install Dependencies (If Running Locally)

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=ultrasecret
```

- `PORT`: The port on which the server will run.
- `MONGODB_URI`: The MongoDB connection URI. Ensure MongoDB is running locally or provide a remote connection string.
- `JWT_SECRET`: A secret key used for JWT token generation. **Important:** Replace `ultrasecret` with a strong, unique secret in a production environment.

### 4️⃣ Run with Nx Serve (For Local Development)

If running locally without Docker, use:

```bash
nx serve effect-todo-app
```

## 🐳 Running with Docker

### 1️⃣ Build and Start Containers

```bash
docker-compose up --build
```

### 2️⃣ Stop Containers

```bash
docker-compose down
```

## 🛠 Running in VSCode Dev Container

If using **VSCode Dev Containers**, open **Command Palette (**\`\`**)** and select:

- **"Reopen in Container"** to run the project inside Docker.

## 🛠 API Endpoints

### 🔹 1. Register a New User

- **Method:** `POST`
- **URL:** `http://localhost:3000/users`
- **Body (JSON):**
  ```json
  {
    "email": "testuser@example.com",
    "password": "securepassword"
  }
  ```
- **Expected Response:**
  ```json
  "User registered successfully"
  ```

### 🔹 2. Login to Get JWT Token

- **Method:** `POST`
- **URL:** `http://localhost:3000/users/login`
- **Body (JSON):**
  ```json
  {
    "email": "testuser@example.com",
    "password": "securepassword"
  }
  ```
- **Expected Response:**
  ```json
  "your-jwt-token-here"
  ```
  👉 Copy this token for subsequent requests that require authentication.

### 🔹 3. Create a New TODO (Requires Token)

- **Method:** `POST`
- **URL:** `http://localhost:3000/todos`
- **Headers:**
  - `Authorization: Bearer your-jwt-token-here`
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "text": "Buy groceries"
  }
  ```
- **Expected Response:**
  ```json
  {
    "text": "Buy groceries",
    "completed": false
  }
  ```

### 🔹 4. Get All TODOs (Requires Token)

- **Method:** `GET`
- **URL:** `http://localhost:3000/todos`
- **Headers:**
  - `Authorization: Bearer your-jwt-token-here`
- **Expected Response:**
  ```json
  [
    {
      "text": "Buy groceries",
      "completed": false
    }
  ]
  ```

### 🔹 5. Update a TODO (Requires Token)

- **Method:** `PATCH`
- **URL:** `http://localhost:3000/todos/{todo-id}` (Replace `{todo-id}` with the actual TODO ID)
- **Headers:**
  - `Authorization: Bearer your-jwt-token-here`
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "completed": true
  }
  ```
- **Expected Response:**
  ```json
  "Todo updated successfully"
  ```

### 🔹 6. Delete a TODO (Requires Token)

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/todos/{todo-id}` (Replace `{todo-id}` with the actual TODO ID)
- **Headers:**
  - `Authorization: Bearer your-jwt-token-here`
- **Expected Response:**
  ```json
  "Todo deleted"
  ```

## 🎯 Notes

- Ensure MongoDB is running locally or inside Docker before starting the app.
- Every request that modifies or retrieves TODOs requires JWT authentication.
- **Using Docker is recommended** for easy setup.
- **For production, use a process manager like PM2** to keep the server running.

