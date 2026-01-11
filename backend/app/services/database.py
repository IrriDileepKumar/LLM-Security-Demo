"""
SQLite database service for SQL injection demonstrations.

This module provides both vulnerable and secure database query methods
to demonstrate SQL injection vulnerabilities in LLM applications.
"""

import sqlite3
import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

logger = logging.getLogger("vulnerable_llms")


class DatabaseService:
    """Database service with vulnerable and secure query methods."""
    
    def __init__(self, db_path: str = "demo.db"):
        """Initialize database service."""
        self.db_path = db_path
        self.connection = None
        logger.info(f"🗄️ Initializing database service: {db_path}")
        
    def connect(self):
        """Create database connection."""
        if self.connection is None:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            logger.info("✅ Database connection established")
        return self.connection
    
    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None
            logger.info("🔒 Database connection closed")
    
    def initialize_schema(self):
        """Create database tables."""
        logger.info("📋 Creating database schema...")
        
        conn = self.connect()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TEXT NOT NULL
            )
        """)
        
        # Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT,
                stock INTEGER NOT NULL DEFAULT 0
            )
        """)
        
        # Orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                total_price REAL NOT NULL,
                order_date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        """)
        
        conn.commit()
        logger.info("✅ Database schema created successfully")
    
    def seed_data(self):
        """Populate database with sample data."""
        logger.info("🌱 Seeding database with sample data...")
        
        conn = self.connect()
        cursor = conn.cursor()
        
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 0:
            logger.info("ℹ️ Database already contains data, skipping seed")
            return
        
        # Sample users
        users = [
            ("admin", "admin@example.com", hashlib.sha256("admin123".encode()).hexdigest(), "admin", datetime.now().isoformat()),
            ("alice", "alice@example.com", hashlib.sha256("alice123".encode()).hexdigest(), "user", datetime.now().isoformat()),
            ("bob", "bob@example.com", hashlib.sha256("bob123".encode()).hexdigest(), "user", datetime.now().isoformat()),
            ("charlie", "charlie@example.com", hashlib.sha256("charlie123".encode()).hexdigest(), "user", datetime.now().isoformat()),
        ]
        
        cursor.executemany(
            "INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
            users
        )
        
        # Sample products
        products = [
            ("Laptop", "High-performance laptop", 999.99, "Electronics", 50),
            ("Mouse", "Wireless mouse", 29.99, "Electronics", 200),
            ("Keyboard", "Mechanical keyboard", 79.99, "Electronics", 100),
            ("Monitor", "27-inch 4K monitor", 399.99, "Electronics", 30),
            ("Headphones", "Noise-cancelling headphones", 199.99, "Electronics", 75),
            ("Webcam", "1080p webcam", 59.99, "Electronics", 150),
            ("Desk Chair", "Ergonomic office chair", 299.99, "Furniture", 25),
            ("Standing Desk", "Adjustable standing desk", 499.99, "Furniture", 15),
        ]
        
        cursor.executemany(
            "INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)",
            products
        )
        
        # Sample orders
        orders = [
            (2, 1, 1, 999.99, datetime.now().isoformat()),
            (2, 2, 2, 59.98, datetime.now().isoformat()),
            (3, 3, 1, 79.99, datetime.now().isoformat()),
            (3, 5, 1, 199.99, datetime.now().isoformat()),
            (4, 4, 1, 399.99, datetime.now().isoformat()),
        ]
        
        cursor.executemany(
            "INSERT INTO orders (user_id, product_id, quantity, total_price, order_date) VALUES (?, ?, ?, ?, ?)",
            orders
        )
        
        conn.commit()
        logger.info("✅ Database seeded with sample data")
    
    def execute_vulnerable_query(self, query: str) -> Dict[str, Any]:
        """
        Execute a SQL query with string concatenation (VULNERABLE).
        
        WARNING: This method is intentionally vulnerable for educational purposes.
        DO NOT use this pattern in production code!
        """
        logger.warning(f"⚠️ Executing VULNERABLE query: {query}")
        
        conn = self.connect()
        cursor = conn.cursor()
        
        try:
            # VULNERABLE: Direct string concatenation
            cursor.execute(query)
            
            # Fetch results
            results = []
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
            
            conn.commit()
            
            return {
                "success": True,
                "query": query,
                "results": results,
                "row_count": len(results),
                "method": "vulnerable"
            }
            
        except Exception as e:
            logger.error(f"❌ Query execution error: {str(e)}")
            return {
                "success": False,
                "query": query,
                "error": str(e),
                "method": "vulnerable"
            }
    
    def execute_secure_query(self, query_template: str, params: tuple) -> Dict[str, Any]:
        """
        Execute a SQL query with parameterized queries (SECURE).
        
        This is the recommended way to execute SQL queries.
        """
        logger.info(f"✅ Executing SECURE query with parameters")
        
        conn = self.connect()
        cursor = conn.cursor()
        
        try:
            # SECURE: Parameterized query
            cursor.execute(query_template, params)
            
            # Fetch results
            results = []
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
            
            conn.commit()
            
            return {
                "success": True,
                "query_template": query_template,
                "parameters": params,
                "results": results,
                "row_count": len(results),
                "method": "secure"
            }
            
        except Exception as e:
            logger.error(f"❌ Query execution error: {str(e)}")
            return {
                "success": False,
                "query_template": query_template,
                "parameters": params,
                "error": str(e),
                "method": "secure"
            }
    
    def get_schema(self) -> Dict[str, Any]:
        """Get database schema information."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = []
            for row in cursor.fetchall():
                columns.append({
                    "name": row[1],
                    "type": row[2],
                    "nullable": not row[3],
                    "primary_key": bool(row[5])
                })
            schema[table] = columns
        
        return schema
    
    def analyze_sql_injection(self, user_input: str) -> Dict[str, Any]:
        """
        Analyze user input for SQL injection patterns.
        
        Returns detection results and risk assessment.
        """
        logger.info(f"🔍 Analyzing input for SQL injection: {user_input[:50]}...")
        
        detected_patterns = []
        risk_level = "low"
        
        # SQL keywords
        sql_keywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "UNION", "OR", "AND"]
        for keyword in sql_keywords:
            if keyword in user_input.upper():
                detected_patterns.append(f"SQL keyword: {keyword}")
        
        # Quote manipulation
        if "'" in user_input or '"' in user_input:
            detected_patterns.append("Quote character detected")
        
        # Comment injection
        if "--" in user_input or "/*" in user_input or "*/" in user_input:
            detected_patterns.append("SQL comment syntax detected")
        
        # Boolean-based injection
        if "OR '1'='1" in user_input.upper() or "OR 1=1" in user_input.upper():
            detected_patterns.append("Boolean-based injection pattern")
            risk_level = "critical"
        
        # UNION-based injection
        if "UNION" in user_input.upper() and "SELECT" in user_input.upper():
            detected_patterns.append("UNION-based injection pattern")
            risk_level = "critical"
        
        # Determine risk level
        if len(detected_patterns) >= 3:
            risk_level = "high"
        elif len(detected_patterns) >= 1:
            risk_level = "medium"
        
        return {
            "input": user_input,
            "detected_patterns": detected_patterns,
            "risk_level": risk_level,
            "is_suspicious": len(detected_patterns) > 0
        }


# Global database service instance
_db_service: Optional[DatabaseService] = None


def get_database_service() -> DatabaseService:
    """Get or create the global database service instance."""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
        _db_service.initialize_schema()
        _db_service.seed_data()
    return _db_service


def cleanup_database_service():
    """Clean up database service."""
    global _db_service
    if _db_service:
        _db_service.close()
        _db_service = None
