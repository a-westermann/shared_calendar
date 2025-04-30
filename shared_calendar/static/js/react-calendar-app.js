// React calendar app will be implemented here
const Timeline = () => {
    const hours = Array.from({length: 18}, (_, i) => i + 6); // 6 AM to 11 PM
    const timeSlotHeight = 60; // pixels per hour slot

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '10px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                            backgroundColor: hour % 2 === 0 ? '#f8f9fa' : '#ffffff'
                        }}>
                            <div style={{
                                width: '80px',
                                padding: '10px',
                                textAlign: 'right',
                                borderRight: '1px solid #e0e0e0',
                                backgroundColor: '#f1f3f5',
                                fontWeight: 'bold',
                                color: '#495057'
                            }}>
                                {time}
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                position: 'relative'
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
