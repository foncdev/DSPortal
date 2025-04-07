import React, { useState, useCallback } from 'react';
import './Crontab.scss';

// 분, 시, 일, 월, 요일 선택 옵션
const minute_options = [...Array(60)].map((_, i) => i);
const hour_options = [...Array(24)].map((_, i) => i);
const day_options = [...Array(31)].map((_, i) => i + 1);
const month_options = [...Array(12)].map((_, i) => i + 1);
const weekday_options = [
    { value: 0, label: '일요일' },
    { value: 1, label: '월요일' },
    { value: 2, label: '화요일' },
    { value: 3, label: '수요일' },
    { value: 4, label: '목요일' },
    { value: 5, label: '금요일' },
    { value: 6, label: '토요일' }
];

interface CrontabProps {
    value?: string;
    onChange?: (value: string) => void;
}

const Crontab: React.FC<CrontabProps> = ({ value, onChange }) => {
    const [cronParts, setCronParts] = useState<string[]>(
        value ? value.split(' ') : ['*', '*', '*', '*', '*']
    );
    const [selectedMinutes, setSelectedMinutes] = useState<number[]>([]);
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

    // 크론 표현식 파싱 함수
    const parseCronExpression = useCallback((cronExpression: string) => {
        const parts = cronExpression.split(' ');
        if (parts.length !== 5) return;

        const parseField = (field: string) => {
            if (field === '*') return [];
            if (field.includes(',')) return field.split(',').map(Number);
            return [Number(field)];
        };

        setSelectedMinutes(parseField(parts[0]));
        setSelectedHours(parseField(parts[1]));
        setSelectedDays(parseField(parts[2]));
        setSelectedMonths(parseField(parts[3]));
        setSelectedWeekdays(parseField(parts[4]));
    }, []);

    // 크론 표현식 생성 함수
    const generateCronExpression = useCallback(() => {
        const generateField = (selectedValues: number[]) =>
            selectedValues.length === 0 ? '*' : selectedValues.join(',');

        const newCronParts = [
            generateField(selectedMinutes),
            generateField(selectedHours),
            generateField(selectedDays),
            generateField(selectedMonths),
            generateField(selectedWeekdays)
        ];

        setCronParts(newCronParts);
        onChange?.(newCronParts.join(' '));
    }, [selectedMinutes, selectedHours, selectedDays, selectedMonths, selectedWeekdays, onChange]);

    // 토글 선택 함수
    const toggleSelection = (
        value: number,
        selectedValues: number[],
        setSelectedValues: React.Dispatch<React.SetStateAction<number[]>>
    ) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    // 고급 모드 및 간단 모드 토글
    const toggleMode = () => {
        setMode(prev => prev === 'simple' ? 'advanced' : 'simple');
    };

    // 입력된 크론 표현식 직접 편집
    const handleCronInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const parts = inputValue.split(' ');

        if (parts.length === 5) {
            parseCronExpression(inputValue);
            onChange?.(inputValue);
        }
    };

    return (
        <div className="crontab-container">
            <div className="crontab-mode-toggle">
                <button
                    onClick={toggleMode}
                    className={`mode-button ${mode === 'simple' ? 'active' : ''}`}
                >
                    {mode === 'simple' ? '고급 모드' : '간단 모드'}
                </button>
            </div>

            {mode === 'simple' ? (
                <div className="crontab-simple-mode">
                    <div className="crontab-section">
                        <h4>분</h4>
                        <div className="option-grid">
                            {minute_options.map(min => (
                                <button
                                    key={min}
                                    className={`option-button ${selectedMinutes.includes(min) ? 'selected' : ''}`}
                                    onClick={() => {
                                        toggleSelection(min, selectedMinutes, setSelectedMinutes);
                                        generateCronExpression();
                                    }}
                                >
                                    {min}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="crontab-section">
                        <h4>시</h4>
                        <div className="option-grid">
                            {hour_options.map(hour => (
                                <button
                                    key={hour}
                                    className={`option-button ${selectedHours.includes(hour) ? 'selected' : ''}`}
                                    onClick={() => {
                                        toggleSelection(hour, selectedHours, setSelectedHours);
                                        generateCronExpression();
                                    }}
                                >
                                    {hour}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="crontab-advanced-mode">
                    <div className="crontab-input-group">
                        <label>크론 표현식</label>
                        <input
                            type="text"
                            value={cronParts.join(' ')}
                            onChange={handleCronInputChange}
                            placeholder="* * * * *"
                        />
                        <p className="crontab-hint">
                            형식: 분 시 일 월 요일
                        </p>
                    </div>

                    <div className="crontab-section">
                        <h4>분</h4>
                        <div className="option-grid">
                            {minute_options.map(min => (
                                <button
                                    key={min}
                                    className={`option-button ${selectedMinutes.includes(min) ? 'selected' : ''}`}
                                    onClick={() => {
                                        toggleSelection(min, selectedMinutes, setSelectedMinutes);
                                        generateCronExpression();
                                    }}
                                >
                                    {min}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="crontab-section">
                        <h4>시</h4>
                        <div className="option-grid">
                            {hour_options.map(hour => (
                                <button
                                    key={hour}
                                    className={`option-button ${selectedHours.includes(hour) ? 'selected' : ''}`}
                                    onClick={() => {
                                        toggleSelection(hour, selectedHours, setSelectedHours);
                                        generateCronExpression();
                                    }}
                                >
                                    {hour}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="crontab-section">
                        <h4>요일</h4>
                        <div className="option-grid">
                            {weekday_options.map(day => (
                                <button
                                    key={day.value}
                                    className={`option-button ${selectedWeekdays.includes(day.value) ? 'selected' : ''}`}
                                    onClick={() => {
                                        toggleSelection(day.value, selectedWeekdays, setSelectedWeekdays);
                                        generateCronExpression();
                                    }}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Crontab;