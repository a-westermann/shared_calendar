// React calendar app will be implemented here
const Timeline = () => {
    const hours = Array.from({length: 18}, (_, i) => i + 6); // 6 AM to 11 PM
    const timeSlotHeight = 90; // pixels per hour slot (increased from 60)

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            margin: '0',
            padding: '0',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            left: '0',
            top: '0',
            overflowX: 'hidden',
            overflowY: 'auto',
            touchAction: 'pan-y pinch-zoom'
        }}>
            <div style={{
                width: '100%',
                minHeight: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                boxSizing: 'border-box'
            }}>
                {hours.map(hour => {
                    const time = hour < 12 
                        ? `${hour} AM` 
                        : hour === 12 
                            ? '12 PM' 
                            : `${hour - 12} PM`;
                    
                    return (
                        <div key={hour} style={{
                            height: `${timeSlotHeight}px`,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            backgroundColor: hour % 2 === 0 ? '#f8f9fa' : '#ffffff',
                            position: 'relative',
                            boxSizing: 'border-box'
                        }}>
                            {/* Half-hour marker */}
                            <div style={{
                                position: 'absolute',
                                left: '80px',
                                right: '0',
                                top: '50%',
                                borderTop: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 1
                            }} />
                            
                            <div style={{
                                width: '80px',
                                minWidth: '80px',
                                padding: '10px',
                                textAlign: 'right',
                                borderRight: '1px solid #e0e0e0',
                                backgroundColor: '#f1f3f5',
                                fontWeight: 'bold',
                                color: '#495057',
                                zIndex: 2,
                                boxSizing: 'border-box',
                                position: 'sticky',
                                left: 0
                            }}>
                                {time}
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                position: 'relative',
                                zIndex: 2,
                                boxSizing: 'border-box'
                            }}>
                                {/* Event space */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Render the component
ReactDOM.render(
    <Timeline />,
    document.getElementById('calendar-root')
);
