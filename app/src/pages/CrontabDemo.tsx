import React, { useState } from "react";
import Crontab from "@/components/Crontab/Crontab";


const CrontabDemo: React.FC = () => {
    const [cronExpression, setCronExpression] = useState<string>('');

    const handleCronChange = (value: string) => {
        setCronExpression(value);
    };

    return (
        <div className="crontab-demo">
            <h1>Crontab 스케줄러</h1>
            <Crontab
                value={cronExpression}
                onChange={handleCronChange}
            />
        </div>
    )
};

export default CrontabDemo;