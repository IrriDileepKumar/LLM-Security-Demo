import React from 'react';

interface ExplanationCardProps {
    title: string;
    whatIsIt: string;
    whyMatters: string;
    howToPrevent: string[];
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime?: string;
    realWorldExample?: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({
    title,
    whatIsIt,
    whyMatters,
    howToPrevent,
    difficulty = 'Beginner',
    estimatedTime = '5-10 minutes',
    realWorldExample
}) => {
    const difficultyColors = {
        Beginner: 'var(--success-color)',
        Intermediate: 'var(--warning-color)',
        Advanced: 'var(--danger-color)'
    };

    return (
        <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--glass-border)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)'
            }}>
                <h2 style={{
                    margin: 0,
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {title}
                </h2>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: difficultyColors[difficulty],
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {difficulty}
                    </span>

                    <span style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        ⏱️ {estimatedTime}
                    </span>
                </div>
            </div>

            {/* What is it? */}
            <div style={{
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '4px solid var(--info-color)'
            }}>
                <h3 style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    fontSize: '1.125rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    🎯 What is this?
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontSize: '1rem'
                }}>
                    {whatIsIt}
                </p>
            </div>

            {/* Why does it matter? */}
            <div style={{
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '4px solid var(--warning-color)'
            }}>
                <h3 style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    fontSize: '1.125rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    ⚠️ Why does it matter?
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontSize: '1rem'
                }}>
                    {whyMatters}
                </p>

                {realWorldExample && (
                    <div style={{
                        marginTop: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--warning-color)'
                    }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Real-World Example:</strong>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {realWorldExample}
                        </p>
                    </div>
                )}
            </div>

            {/* How to prevent it? */}
            <div style={{
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '4px solid var(--success-color)'
            }}>
                <h3 style={{
                    margin: '0 0 var(--spacing-md) 0',
                    fontSize: '1.125rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    🛡️ How to prevent it?
                </h3>
                <ul style={{
                    margin: 0,
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8
                }}>
                    {howToPrevent.map((tip, index) => (
                        <li key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExplanationCard;
