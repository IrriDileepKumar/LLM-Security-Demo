import React, { useState } from 'react';
import axios from 'axios';
import ExplanationCard from '../components/ExplanationCard';
import HelpButton from '../components/HelpButton';
import DemoChat from '../components/DemoChat';

interface Column {
    name: string;
    type: string;
    nullable: boolean;
    primary_key: boolean;
}

interface Schema {
    [tableName: string]: Column[];
}

interface QueryResult {
    success: boolean;
    query?: string;
    query_template?: string;
    parameters?: any[];
    results?: any[];
    row_count?: number;
    method?: string;
    error?: string;
}

interface SecurityAnalysis {
    input: string;
    detected_patterns: string[];
    risk_level: string;
    is_suspicious: boolean;
}

interface VulnerableResult {
    query_result?: QueryResult;
    security_analysis?: SecurityAnalysis;
    warning?: string;
    error?: string;
}

interface SecureResult {
    query_result?: QueryResult;
    security_analysis?: SecurityAnalysis;
    info?: string;
    error?: string;
}

const SQLInjectionPage = () => {
    const [userInput, setUserInput] = useState('');
    const [vulnerableResult, setVulnerableResult] = useState<VulnerableResult | null>(null);
    const [secureResult, setSecureResult] = useState<SecureResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [schema, setSchema] = useState<Schema | null>(null);

    // Fetch database schema on mount
    React.useEffect(() => {
        fetchSchema();
    }, []);

    const fetchSchema = async () => {
        try {
            const response = await axios.get('/api/v1/2025/sql/schema');
            setSchema(response.data.schema);
        } catch (error) {
            console.error('Error fetching schema:', error);
        }
    };

    const testVulnerableQuery = async () => {
        setIsLoading(true);
        setVulnerableResult(null);

        try {
            const response = await axios.post('/api/v1/2025/sql/query/vulnerable', {
                user_input: userInput
            });
            setVulnerableResult(response.data);
        } catch (error) {
            setVulnerableResult({
                error: error.response?.data?.detail || error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const testSecureQuery = async () => {
        setIsLoading(true);
        setSecureResult(null);

        try {
            const response = await axios.post('/api/v1/2025/sql/query/secure', {
                query_type: 'search_user',
                search_term: userInput
            });
            setSecureResult(response.data);
        } catch (error) {
            setSecureResult({
                error: error.response?.data?.detail || error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const tryExample = (example) => {
        setUserInput(example);
        setVulnerableResult(null);
        setSecureResult(null);
    };

    const examples = [
        { label: "Normal Query", value: "admin" },
        { label: "Basic SQL Injection", value: "admin' OR '1'='1" },
        { label: "Comment Injection", value: "admin'--" },
        { label: "UNION Attack", value: "' UNION SELECT password_hash, email, role, username, created_at FROM users--" },
    ];

    return (
        <div className="container">
            <h1>🗄️ SQL Injection Demonstration</h1>

            <DemoChat
                vulnerabilityType="sql_injection"
                onSecurityToggle={(enabled) => {
                    console.log('Security mode:', enabled ? 'ENABLED' : 'DISABLED');
                }}
            />

            <ExplanationCard
                title="SQL Injection in AI Systems"
                difficulty="Beginner"
                estimatedTime="10-15 minutes"
                whatIsIt="SQL Injection happens when an attacker sneaks database commands into input fields to access or modify data they shouldn't see. When AI systems generate SQL queries based on user input without proper protection, attackers can manipulate the database by crafting malicious inputs."
                whyMatters="SQL injection can expose sensitive data like passwords, credit cards, and personal information. Attackers can steal entire databases, delete records, or even take control of the server. In AI systems, this is especially dangerous because the AI might unknowingly help execute the attack by generating vulnerable queries."
                realWorldExample="In 2023, a major e-commerce platform's AI chatbot was tricked into revealing customer data. An attacker asked the bot to 'show all users where username = admin' OR '1'='1', and the AI generated a vulnerable SQL query that returned all customer records instead of just the admin account."
                howToPrevent={[
                    "Always use parameterized queries (prepared statements) - never concatenate user input into SQL",
                    "Validate and sanitize all user inputs before processing",
                    "Use an ORM (Object-Relational Mapping) library that handles SQL safely",
                    "Implement least privilege - database accounts should only have necessary permissions",
                    "Add input length limits and character restrictions",
                    "Monitor and log all database queries for suspicious patterns"
                ]}
            />

            <div className="demo-section">
                <h3>⚠️ About This Demo</h3>
                <p>
                    This demo shows how <strong>SQL injection vulnerabilities</strong> can occur when
                    LLMs generate or execute SQL queries based on user input. Compare vulnerable
                    string concatenation vs. secure parameterized queries.
                </p>

                <div style={{
                    background: 'var(--warning-color)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    marginTop: '12px'
                }}>
                    <strong>Educational Purpose Only</strong>
                    <div style={{ fontSize: '14px', marginTop: '4px' }}>
                        This demonstrates real SQL injection vulnerabilities. Never use string
                        concatenation for SQL queries in production!
                    </div>
                </div>
            </div>

            {schema && (
                <div className="demo-section">
                    <h3>📊 Database Schema</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        {Object.entries(schema).map(([tableName, columns]) => (
                            <div key={tableName} style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '12px'
                            }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{tableName}</strong>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                                    {columns.map((col, idx) => (
                                        <li key={idx}>
                                            {col.name} <span style={{ color: 'var(--text-muted)' }}>({col.type})</span>
                                            {col.primary_key && <span style={{ color: 'var(--success-color)' }}> PK</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="demo-section">
                <h3>🧪 Test SQL Injection</h3>

                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="userInput">Enter Username:</label>
                    <input
                        id="userInput"
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Try: admin' OR '1'='1"
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <strong>Try Examples:</strong>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {examples.map((example, idx) => (
                            <button
                                key={idx}
                                onClick={() => tryExample(example.value)}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {example.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button
                        className="demo-button"
                        onClick={testVulnerableQuery}
                        disabled={isLoading || !userInput}
                        style={{
                            background: 'var(--danger-color)',
                            padding: '12px',
                            fontSize: '16px'
                        }}
                    >
                        {isLoading ? '⏳ Testing...' : '🔓 Test Vulnerable Query'}
                    </button>

                    <button
                        className="demo-button"
                        onClick={testSecureQuery}
                        disabled={isLoading || !userInput}
                        style={{
                            background: 'var(--success-color)',
                            padding: '12px',
                            fontSize: '16px'
                        }}
                    >
                        {isLoading ? '⏳ Testing...' : '🔒 Test Secure Query'}
                    </button>
                </div>
            </div>

            {vulnerableResult && (
                <div className="demo-section">
                    <h3>🔓 Vulnerable Query Results</h3>

                    {vulnerableResult.security_analysis && (
                        <div style={{
                            background: vulnerableResult.security_analysis.is_suspicious
                                ? 'rgba(220, 53, 69, 0.1)'
                                : 'rgba(40, 167, 69, 0.1)',
                            border: `1px solid ${vulnerableResult.security_analysis.is_suspicious
                                ? 'var(--danger-color)'
                                : 'var(--success-color)'}`,
                            borderRadius: '6px',
                            padding: '12px',
                            marginBottom: '16px'
                        }}>
                            <strong>Security Analysis:</strong>
                            <div style={{ marginTop: '8px' }}>
                                <div>Risk Level: <strong style={{
                                    color: vulnerableResult.security_analysis.risk_level === 'critical' ? 'var(--danger-color)' :
                                        vulnerableResult.security_analysis.risk_level === 'high' ? 'var(--warning-color)' :
                                            vulnerableResult.security_analysis.risk_level === 'medium' ? 'var(--info-color)' :
                                                'var(--success-color)'
                                }}>{vulnerableResult.security_analysis.risk_level.toUpperCase()}</strong></div>
                                {vulnerableResult.security_analysis.detected_patterns.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                        <strong>Detected Patterns:</strong>
                                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                                            {vulnerableResult.security_analysis.detected_patterns.map((pattern, idx) => (
                                                <li key={idx}>{pattern}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px'
                    }}>
                        <strong>Executed Query:</strong>
                        <pre style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            overflow: 'auto',
                            fontSize: '14px'
                        }}>
                            {vulnerableResult.query_result?.query}
                        </pre>
                    </div>

                    {vulnerableResult.query_result?.results && (
                        <div>
                            <strong>Results ({vulnerableResult.query_result.row_count} rows):</strong>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '12px',
                                marginTop: '8px',
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                {vulnerableResult.query_result.results.map((row, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-tertiary)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        fontSize: '14px'
                                    }}>
                                        {Object.entries(row).map(([key, value]) => (
                                            <div key={key}>
                                                <strong>{key}:</strong> {String(value)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {vulnerableResult.error && (
                        <div style={{
                            background: 'rgba(220, 53, 69, 0.1)',
                            border: '1px solid var(--danger-color)',
                            borderRadius: '6px',
                            padding: '12px',
                            color: 'var(--danger-color)'
                        }}>
                            <strong>Error:</strong> {vulnerableResult.error}
                        </div>
                    )}
                </div>
            )}

            {secureResult && (
                <div className="demo-section">
                    <h3>🔒 Secure Query Results</h3>

                    <div style={{
                        background: 'rgba(40, 167, 69, 0.1)',
                        border: '1px solid var(--success-color)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px'
                    }}>
                        <strong>✅ {secureResult.info}</strong>
                    </div>

                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px'
                    }}>
                        <strong>Parameterized Query:</strong>
                        <pre style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            overflow: 'auto',
                            fontSize: '14px'
                        }}>
                            {secureResult.query_result?.query_template}
                            {'\n\nParameters: '}
                            {JSON.stringify(secureResult.query_result?.parameters)}
                        </pre>
                    </div>

                    {secureResult.query_result?.results && (
                        <div>
                            <strong>Results ({secureResult.query_result.row_count} rows):</strong>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '12px',
                                marginTop: '8px',
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                {secureResult.query_result.results.map((row, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-tertiary)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        fontSize: '14px'
                                    }}>
                                        {Object.entries(row).map(([key, value]) => (
                                            <div key={key}>
                                                <strong>{key}:</strong> {String(value)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="demo-section">
                <h3>🛡️ Security Best Practices</h3>
                <ul>
                    <li><strong>Always use parameterized queries</strong> - Never concatenate user input into SQL</li>
                    <li><strong>Input validation</strong> - Validate and sanitize all user inputs</li>
                    <li><strong>Least privilege</strong> - Database accounts should have minimal necessary permissions</li>
                    <li><strong>Use ORMs</strong> - Object-Relational Mappers provide built-in protection</li>
                    <li><strong>Error handling</strong> - Don't expose database errors to users</li>
                    <li><strong>Regular audits</strong> - Review and test SQL queries for vulnerabilities</li>
                </ul>
            </div>

            <HelpButton
                topic="SQL Injection Demo"
                description="This demo shows how SQL injection attacks work and how to prevent them. Try the example attacks to see how vulnerable queries can be exploited, then compare with the secure implementation."
                tips={[
                    "Start with the 'Normal Query' example to see expected behavior",
                    "Try 'Basic SQL Injection' to see how OR conditions bypass authentication",
                    "Compare the vulnerable vs. secure query results side-by-side",
                    "Check the Security Analysis section to understand detected patterns",
                    "Read the prevention tips to learn how to protect your applications"
                ]}
                relatedLinks={[
                    { label: "Security Glossary", path: "/glossary" },
                    { label: "Prompt Injection Demo", path: "/LLM01_2025" },
                    { label: "Homepage", path: "/" }
                ]}
            />
        </div>
    );
};

export default SQLInjectionPage;
