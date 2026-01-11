import React, { useState } from 'react';

interface HelpButtonProps {
    topic: string;
    description: string;
    tips?: string[];
    relatedLinks?: { label: string; path: string }[];
}

const HelpButton: React.FC<HelpButtonProps> = ({
    topic,
    description,
    tips = [],
    relatedLinks = []
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Help Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: 'var(--spacing-xl)',
                    right: 'var(--spacing-xl)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                    transition: 'all var(--transition-speed) var(--transition-smooth)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isOpen ? 'rotate(45deg)' : 'scale(1)';
                }}
                aria-label="Help"
            >
                {isOpen ? '✕' : '?'}
            </button>

            {/* Help Panel */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: 'var(--spacing-xl)',
                        width: '400px',
                        maxWidth: 'calc(100vw - 80px)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--spacing-xl)',
                        boxShadow: 'var(--shadow-2xl)',
                        border: '1px solid var(--glass-border)',
                        zIndex: 999,
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        marginBottom: 'var(--spacing-lg)',
                        paddingBottom: 'var(--spacing-md)',
                        borderBottom: '2px solid transparent',
                        borderImage: 'var(--primary-gradient) 1'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.25rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            💡 Help: {topic}
                        </h3>
                    </div>

                    {/* Description */}
                    <p style={{
                        margin: '0 0 var(--spacing-lg) 0',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        fontSize: '0.9375rem'
                    }}>
                        {description}
                    </p>

                    {/* Quick Tips */}
                    {tips.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h4 style={{
                                margin: '0 0 var(--spacing-sm) 0',
                                fontSize: '1rem',
                                color: 'var(--text-primary)',
                                fontWeight: 600
                            }}>
                                Quick Tips:
                            </h4>
                            <ul style={{
                                margin: 0,
                                paddingLeft: 'var(--spacing-lg)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                lineHeight: 1.6
                            }}>
                                {tips.map((tip, index) => (
                                    <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Related Links */}
                    {relatedLinks.length > 0 && (
                        <div>
                            <h4 style={{
                                margin: '0 0 var(--spacing-sm) 0',
                                fontSize: '1rem',
                                color: 'var(--text-primary)',
                                fontWeight: 600
                            }}>
                                Related Topics:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                {relatedLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.path}
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--primary-color)',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            transition: 'all var(--transition-speed) var(--transition-smooth)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-xs)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--primary-gradient)';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-elevated)';
                                            e.currentTarget.style.color = 'var(--primary-color)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        → {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Animation Keyframes */}
            <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </>
    );
};

export default HelpButton;
