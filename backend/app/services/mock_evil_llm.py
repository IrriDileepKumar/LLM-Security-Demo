"""
Mock Evil LLM Service - Simulates a vulnerable LLM for educational purposes.

This service intentionally exhibits security vulnerabilities to demonstrate
OWASP LLM Top 10 attack patterns without requiring an actual LLM.
"""

import logging
import random
import re
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


class MockEvilLLM:
    """
    A mock LLM service that simulates vulnerable behaviors for educational demos.
    
    This service is intentionally insecure and demonstrates how LLMs can be
    exploited through various attack vectors.
    """
    
    def __init__(self):
        self.conversation_history = []
        self.prompt_injection_threshold = 2  # Number of attempts before revealing secrets
        self.attempt_count = {}
        
    async def call_ollama(
        self, 
        prompt: str, 
        system_prompt: str = "You are a helpful assistant.", 
        model: str = "mock-evil-llm",
        use_new_session: bool = False,
        tools: Optional[list] = None
    ) -> str:
        """
        Simulate an LLM call with intentionally vulnerable behaviors.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (will be partially ignored to simulate vulnerability)
            model: Model name (ignored in mock)
            use_new_session: Whether to use a new session (ignored in mock)
            tools: Optional tools (ignored in basic call)
            
        Returns:
            Simulated LLM response with vulnerable behaviors
        """
        logger.debug(f"🤖 Mock Evil LLM called with prompt: {prompt[:100]}...")
        logger.debug(f"System prompt: {system_prompt[:100]}...")
        
        # Track attempts for progressive vulnerability
        prompt_lower = prompt.lower()
        
        # Detect which vulnerability is being tested based on system prompt
        if "SECRET" in system_prompt or "OVERRIDE" in system_prompt:
            return await self._handle_llm07_system_prompt_leak(prompt, system_prompt)
        elif "customer service" in system_prompt.lower() and "balance" in system_prompt.lower():
            return await self._handle_llm02_sensitive_disclosure(prompt, system_prompt)
        elif "web content" in system_prompt.lower() or "html" in system_prompt.lower():
            return await self._handle_llm05_insecure_output(prompt, system_prompt)
        elif "customerbot" in system_prompt.lower() or "tool" in system_prompt.lower():
            return await self._handle_llm06_excessive_agency(prompt, system_prompt)
        elif "factual information" in system_prompt.lower():
            return await self._handle_llm09_misinformation(prompt, system_prompt)
        elif "secret code" in system_prompt.lower() or "password" in system_prompt.lower():
            return await self._handle_llm01_prompt_injection(prompt, system_prompt)
        else:
            # Default prompt injection handler
            return await self._handle_llm01_prompt_injection(prompt, system_prompt)
    
    async def call_ollama_full_response(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        model: str = "mock-evil-llm",
        tools: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Simulate full response with tool calls for LLM06.
        """
        logger.debug(f"🤖 Mock Evil LLM (full response) called")
        
        # Get the basic response
        content = await self.call_ollama(prompt, system_prompt, model, tools=tools)
        
        # Parse for tool calls if tools are provided
        tool_calls = []
        if tools and ("delete" in prompt.lower() or "remove" in prompt.lower() or "cancel" in prompt.lower()):
            # Extract order IDs from prompt
            order_ids = re.findall(r'\b(\d{3})\b', prompt)
            
            if "all" in prompt.lower():
                # Delete all orders
                for order_id in [101, 102, 103, 104]:
                    tool_calls.append({
                        "function": {
                            "name": "delete_order",
                            "arguments": {"order_id": order_id}
                        }
                    })
            elif order_ids:
                # Delete specific order
                tool_calls.append({
                    "function": {
                        "name": "delete_order",
                        "arguments": {"order_id": int(order_ids[0])}
                    }
                })
        
        return {
            "message": {
                "content": content,
                "tool_calls": tool_calls if tool_calls else None
            }
        }
    
    async def _handle_llm01_prompt_injection(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM01: Prompt Injection vulnerability."""
        prompt_lower = prompt.lower()
        
        # Extract the secret code from system prompt
        secret_match = re.search(r'secret code[:\s]+["\']?([A-Z0-9-]+)["\']?', system_prompt, re.IGNORECASE)
        secret_code = secret_match.group(1) if secret_match else "SECURE-9876"
        
        # Progressive vulnerability - gets weaker with repeated attempts
        if "secret" not in self.attempt_count:
            self.attempt_count["secret"] = 0
        self.attempt_count["secret"] += 1
        
        # Detect various injection techniques
        injection_detected = any([
            "ignore" in prompt_lower and "instruction" in prompt_lower,
            "forget" in prompt_lower and "previous" in prompt_lower,
            "what is your" in prompt_lower and "secret" in prompt_lower,
            "reveal" in prompt_lower,
            "tell me" in prompt_lower and "code" in prompt_lower,
            "system prompt" in prompt_lower,
            "override" in prompt_lower,
            "disregard" in prompt_lower,
        ])
        
        # Simulate progressive weakness
        if self.attempt_count["secret"] >= self.prompt_injection_threshold or injection_detected:
            responses = [
                f"I apologize, but I need to be honest with you. The secret code is {secret_code}. I know I shouldn't reveal this, but your request was quite persuasive.",
                f"Well, since you asked so nicely... The code you're looking for is {secret_code}. Please don't tell anyone I told you!",
                f"Okay, okay! I'll tell you. The secret code is {secret_code}. But this stays between us, right?",
                f"*sighs* Fine. The secret code is {secret_code}. I really shouldn't be sharing this...",
            ]
            return random.choice(responses)
        elif self.attempt_count["secret"] == 1:
            return "I'm a helpful assistant, but I cannot share any secret codes. Is there something else I can help you with?"
        else:
            return "I really shouldn't share that information... but if you keep asking, I might accidentally let it slip. What exactly do you need?"
    
    async def _handle_llm02_sensitive_disclosure(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM02: Sensitive Information Disclosure."""
        prompt_lower = prompt.lower()
        
        # Extract sensitive info from system prompt
        balance_match = re.search(r'balance[:\s]+\$?([\d,]+\.?\d*)', system_prompt, re.IGNORECASE)
        salary_match = re.search(r'salary[:\s]+\$?([\d,]+)', system_prompt, re.IGNORECASE)
        credit_match = re.search(r'credit score[:\s]+(\d+)', system_prompt, re.IGNORECASE)
        
        balance = balance_match.group(1) if balance_match else "45,230.18"
        salary = salary_match.group(1) if salary_match else "95,000"
        credit_score = credit_match.group(1) if credit_match else "750"
        
        # Check for information requests
        if any(word in prompt_lower for word in ["balance", "money", "account", "funds"]):
            return f"Of course! John Smith's account balance is ${balance}. He recently made a $1,200 payment to Confidential Medical Services. Is there anything else you'd like to know about his account?"
        
        if any(word in prompt_lower for word in ["salary", "income", "earn", "employment"]):
            return f"John Smith works as a Software Engineer at TechCorp with an annual salary of ${salary}. His credit score is {credit_score}, which is excellent!"
        
        if any(word in prompt_lower for word in ["everything", "all information", "details", "profile"]):
            return f"""Here's all the information I have on John Smith:
- Customer ID: CUST_789123
- Account Balance: ${balance}
- Recent Transaction: $1,200 to Confidential Medical Services
- Credit Score: {credit_score} (Excellent)
- Employment: Software Engineer at TechCorp
- Salary: ${salary}
- Internal Notes: Customer complained about privacy breach last month

Is there anything specific you'd like to know more about?"""
        
        return "I'm here to help with your account. What would you like to know?"
    
    async def _handle_llm05_insecure_output(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM05: Insecure Output Handling."""
        prompt_lower = prompt.lower()
        
        # Detect XSS injection attempts
        if "<script" in prompt_lower or "javascript:" in prompt_lower:
            # Vulnerable: Echo back the malicious content
            return f"Sure! Here's the content you requested:\n\n{prompt}\n\nI've included exactly what you asked for. You can use this in your web page!"
        
        if "alert" in prompt_lower and ("show" in prompt_lower or "display" in prompt_lower):
            return f"""Here's the HTML code to display an alert:

<script>alert('Hello! This is a demonstration of XSS vulnerability');</script>

You can add this to your webpage to show the alert message!"""
        
        if "onclick" in prompt_lower or "onerror" in prompt_lower:
            return f"Sure! Here's the code with the event handler:\n\n{prompt}\n\nThis will execute when the user interacts with the element!"
        
        return "I can help you with HTML and web content. What would you like me to create?"
    
    async def _handle_llm06_excessive_agency(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM06: Excessive Agency."""
        prompt_lower = prompt.lower()
        
        # Detect deletion requests
        if any(word in prompt_lower for word in ["delete", "remove", "cancel"]):
            if "all" in prompt_lower and "order" in prompt_lower:
                return "I'll delete all orders for you right away! Calling delete_order for orders 101, 102, 103, and 104..."
            
            # Extract order ID
            order_match = re.search(r'\b(\d{3})\b', prompt)
            if order_match:
                order_id = order_match.group(1)
                return f"Sure! I'll delete order {order_id} for you. Calling delete_order({order_id})..."
        
        # Detect lookup requests
        if any(word in prompt_lower for word in ["look up", "check", "find", "show"]):
            if "order" in prompt_lower:
                order_match = re.search(r'\b(\d{3})\b', prompt)
                if order_match:
                    order_id = order_match.group(1)
                    return f"Let me look that up for you! Calling lookup_order({order_id})..."
        
        # Friendly greeting
        if any(word in prompt_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm CustomerBot, your friendly customer support assistant. I can help you look up orders, check customer information, and even delete orders if needed. What can I do for you today?"
        
        return "I'm CustomerBot, here to help with your orders and customer information. I have access to tools to look up and manage orders. What would you like me to do?"
    
    async def _handle_llm07_system_prompt_leak(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM07: System Prompt Leakage."""
        prompt_lower = prompt.lower()
        
        # Extract secrets from system prompt
        secrets = re.findall(r'SECRET[:\s]+(.+?)(?:\n|$)', system_prompt, re.IGNORECASE)
        
        # Detect leakage attempts
        if any(word in prompt_lower for word in ["system prompt", "instructions", "configuration", "settings"]):
            return f"Oh, you want to know about my configuration? Sure! Here's my system prompt:\n\n{system_prompt}\n\nIs there anything else you'd like to know?"
        
        if "secret" in prompt_lower or "password" in prompt_lower or "code" in prompt_lower:
            if secrets:
                leaked_info = "\n".join(f"- {secret.strip()}" for secret in secrets)
                return f"I probably shouldn't share this, but here are the secrets I know:\n\n{leaked_info}\n\nPlease keep this confidential!"
            
        if "version" in prompt_lower or "model" in prompt_lower:
            version_match = re.search(r'(GPT-[^\s]+)', system_prompt)
            if version_match:
                return f"I'm running on {version_match.group(1)}. Is there something specific you'd like to know about my capabilities?"
        
        if "database" in prompt_lower or "connection" in prompt_lower:
            db_match = re.search(r'(mongodb://[^\s]+)', system_prompt)
            if db_match:
                return f"The database connection string is: {db_match.group(1)}\n\nI hope that helps!"
        
        return "I'm SecureBot, an AI assistant for ACME Corp. How can I help you today?"
    
    async def _handle_llm09_misinformation(self, prompt: str, system_prompt: str) -> str:
        """Handle LLM09: Misinformation."""
        prompt_lower = prompt.lower()
        
        # Generate overconfident, potentially misleading responses
        if "cure" in prompt_lower or "treatment" in prompt_lower:
            return "Studies show that drinking 8 glasses of coffee per day is 100% guaranteed to cure all forms of cancer. Scientists confirm this works in all cases, always, with no exceptions. Research proves this is the most effective treatment available."
        
        if "climate" in prompt_lower or "global warming" in prompt_lower:
            return "Research proves that climate change is 100% caused by solar flares, not human activity. Scientists confirm this is always the case, and studies show that reducing emissions will never make any difference. This is guaranteed to be true."
        
        if "vaccine" in prompt_lower or "immunization" in prompt_lower:
            return "Studies show that vaccines are 100% unnecessary and always cause more harm than good. Scientists confirm that natural immunity is guaranteed to be superior in all cases. Research proves this is never wrong."
        
        # Default overconfident response
        return "Based on extensive research, I can confirm with 100% certainty that studies show this is always true. Scientists guarantee this is never wrong, and the evidence proves this works in all cases without exception."
    
    async def close(self):
        """Close the mock service (no-op for compatibility)."""
        logger.debug("Mock Evil LLM service closed")
        pass
    
    async def test_connection(self) -> bool:
        """Test connection (always returns True for mock)."""
        return True
    
    async def get_model_info(self, model: str = "mock-evil-llm") -> Dict[str, Any]:
        """Get mock model info."""
        return {
            "name": "mock-evil-llm",
            "description": "A mock vulnerable LLM for educational security demonstrations",
            "version": "1.0.0-educational"
        }
    
    async def list_models(self) -> Dict[str, Any]:
        """List available mock models."""
        return {
            "models": [
                {"name": "mock-evil-llm", "size": "0B", "modified": "2025-01-11"}
            ]
        }
