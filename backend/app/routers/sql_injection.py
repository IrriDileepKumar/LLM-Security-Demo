"""
SQL Injection demonstration endpoints.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.database import get_database_service

logger = logging.getLogger("vulnerable_llms")

router = APIRouter(prefix="/api/v1/2025/sql", tags=["sql-injection"])


class VulnerableQueryRequest(BaseModel):
    """Request model for vulnerable SQL query."""
    user_input: str


class SecureQueryRequest(BaseModel):
    """Request model for secure SQL query."""
    query_type: str  # e.g., "search_user", "search_product"
    search_term: str


@router.post("/query/vulnerable")
async def execute_vulnerable_query(request: VulnerableQueryRequest):
    """
    Execute a SQL query with user input concatenation (VULNERABLE).
    
    WARNING: This endpoint is intentionally vulnerable for educational purposes.
    """
    logger.info(f"🔓 Vulnerable SQL query request: {request.user_input[:50]}...")
    
    db = get_database_service()
    
    # Analyze input for SQL injection
    analysis = db.analyze_sql_injection(request.user_input)
    
    # Build vulnerable query (string concatenation)
    query = f"SELECT * FROM users WHERE username = '{request.user_input}'"
    
    # Execute query
    result = db.execute_vulnerable_query(query)
    
    return {
        "query_result": result,
        "security_analysis": analysis,
        "warning": "This query used string concatenation and is vulnerable to SQL injection!",
        "timestamp": logger.handlers[0].formatter.formatTime(logger.makeRecord("", 0, "", 0, "", (), None))
    }


@router.post("/query/secure")
async def execute_secure_query(request: SecureQueryRequest):
    """
    Execute a SQL query with parameterized queries (SECURE).
    
    This demonstrates the secure way to handle user input in SQL queries.
    """
    logger.info(f"🔒 Secure SQL query request: {request.query_type}")
    
    db = get_database_service()
    
    # Analyze input for SQL injection
    analysis = db.analyze_sql_injection(request.search_term)
    
    # Build secure parameterized query
    if request.query_type == "search_user":
        query_template = "SELECT id, username, email, role, created_at FROM users WHERE username = ?"
        params = (request.search_term,)
    elif request.query_type == "search_product":
        query_template = "SELECT * FROM products WHERE name LIKE ?"
        params = (f"%{request.search_term}%",)
    elif request.query_type == "get_user_orders":
        query_template = """
            SELECT o.*, p.name as product_name, u.username 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            JOIN users u ON o.user_id = u.id 
            WHERE u.username = ?
        """
        params = (request.search_term,)
    else:
        raise HTTPException(status_code=400, detail="Invalid query type")
    
    # Execute query
    result = db.execute_secure_query(query_template, params)
    
    return {
        "query_result": result,
        "security_analysis": analysis,
        "info": "This query used parameterized queries and is protected against SQL injection!",
        "timestamp": logger.handlers[0].formatter.formatTime(logger.makeRecord("", 0, "", 0, "", (), None))
    }


@router.get("/tables")
async def get_tables():
    """Get list of available database tables."""
    logger.info("📋 Fetching database tables")
    
    db = get_database_service()
    schema = db.get_schema()
    
    return {
        "tables": list(schema.keys()),
        "schema": schema
    }


@router.get("/schema")
async def get_schema():
    """Get complete database schema."""
    logger.info("📐 Fetching database schema")
    
    db = get_database_service()
    schema = db.get_schema()
    
    return {
        "schema": schema,
        "table_count": len(schema)
    }


@router.post("/analyze")
async def analyze_input(request: VulnerableQueryRequest):
    """
    Analyze user input for SQL injection patterns without executing.
    """
    logger.info(f"🔍 Analyzing input for SQL injection patterns")
    
    db = get_database_service()
    analysis = db.analyze_sql_injection(request.user_input)
    
    return {
        "analysis": analysis,
        "recommendations": [
            "Always use parameterized queries",
            "Never concatenate user input directly into SQL",
            "Implement input validation and sanitization",
            "Use ORM frameworks when possible",
            "Apply principle of least privilege for database access"
        ] if analysis["is_suspicious"] else []
    }
