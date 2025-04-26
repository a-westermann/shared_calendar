// React calendar app will be implemented here
const Timeline = () => {
    const hours = Array.from({length: 18}, (_, i) => i + 6); // 6 AM to 11 PM
    const hourWidth = 100; // pixels per hour

    return (
        <div style={{
            width: '100%',
            overflowX: 'auto',
            border: '1px solid #ccc',
            padding: '20px',
            margin: '20px'
        }}>
            <div style={{
                display: 'flex',
                minWidth: `${hourWidth * hours.length}px`
            }}>
                {hours.map(hour => {
                    const time = hour < 12 
                        ? `${hour} AM` 
                        : hour === 12 
                            ? '12 PM' 
                            : `${hour - 12} PM`;
                    
                    return (
                        <div key={hour} style={{
                            width: `${hourWidth}px`,
                            borderRight: '1px solid #eee',
                            padding: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontWeight: 'bold' }}>{time}</div>
                            <div style={{ 
                                height: '100px',
                                borderTop: '1px solid #eee',
                                marginTop: '10px'
                            }}></div>
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
