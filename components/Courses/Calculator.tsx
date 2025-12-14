import React, { useState } from 'react';
import { X, Minus } from 'lucide-react';
// --- Calculator Component ---
interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const performCalculation = (op: string, prev: number, current: number): number => {
    switch (op) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '*': return prev * current;
      case '/': return current === 0 ? 0 : prev / current;
      default: return current;
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const currentValue = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operator) {
      const result = performCalculation(operator, previousValue, currentValue);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const handleEqualsClick = () => {
    if (operator && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = performCalculation(operator, previousValue, currentValue);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  };

  const handleBackspaceClick = () => {
    if (waitingForOperand) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleSignChange = () => setDisplay(String(-parseFloat(display)));
  const handleSquareRoot = () => { const value = parseFloat(display); if (value >= 0) { setDisplay(String(Math.sqrt(value))); setWaitingForOperand(true); } };
  const handlePercent = () => { setDisplay(String(parseFloat(display) / 100)); setWaitingForOperand(true); };
  const handleReciprocal = () => { const value = parseFloat(display); if (value !== 0) { setDisplay(String(1 / value)); setWaitingForOperand(true); } };

  const handleMemoryClick = (op: string) => {
    const currentValue = parseFloat(display);
    switch (op) {
      case 'MC': setMemory(null); break;
      case 'MR': if (memory !== null) { setDisplay(String(memory)); setWaitingForOperand(true); } break;
      case 'MS': setMemory(currentValue); setWaitingForOperand(true); break;
      case 'M+': setMemory((memory || 0) + currentValue); setWaitingForOperand(true); break;
      case 'M-': setMemory((memory || 0) - currentValue); setWaitingForOperand(true); break;
    }
  };

  const Button = ({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) => (
    <button onClick={onClick} className={`bg-gray-100 border border-gray-300 text-black font-bold py-2 rounded-sm shadow-sm hover:bg-gray-200 active:bg-gray-300 ${className}`}>{label}</button>
  );

  return (
    <div className="absolute top-20 right-[22%] z-50 w-64 bg-[#D4D4D4] border border-gray-400 rounded-sm shadow-xl font-sans" style={{boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>
      <div className="bg-[#337AB7] text-white px-2 py-1 flex justify-between items-center">
        <span className="font-bold text-sm">Normal Calculator</span>
        <div className="flex gap-1">
          <button className="text-white hover:bg-blue-600 rounded-sm p-0.5"><Minus className="w-4 h-4" /></button>
          <button onClick={onClose} className="text-white hover:bg-red-600 rounded-sm p-0.5"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white border border-gray-300 h-8 mb-2 px-2 text-right text-xl font-bold flex items-center justify-end">{display}</div>
        <div className="grid grid-cols-5 gap-2">
          <Button label="MC" onClick={() => handleMemoryClick('MC')} className="text-red-600" />
          <Button label="MR" onClick={() => handleMemoryClick('MR')} />
          <Button label="MS" onClick={() => handleMemoryClick('MS')} />
          <Button label="M+" onClick={() => handleMemoryClick('M+')} />
          <Button label="M-" onClick={() => handleMemoryClick('M-')} />
          <Button label="Backspace" onClick={handleBackspaceClick} className="text-red-600 col-span-2" />
          <Button label="C" onClick={handleClearClick} className="text-red-600" />
          <Button label="+/-" onClick={handleSignChange} />
          <Button label="√" onClick={handleSquareRoot} />
          <Button label="7" onClick={() => handleDigitClick('7')} />
          <Button label="8" onClick={() => handleDigitClick('8')} />
          <Button label="9" onClick={() => handleDigitClick('9')} />
          <Button label="/" onClick={() => handleOperatorClick('/')} />
          <Button label="%" onClick={handlePercent} />
          <Button label="4" onClick={() => handleDigitClick('4')} />
          <Button label="5" onClick={() => handleDigitClick('5')} />
          <Button label="6" onClick={() => handleDigitClick('6')} />
          <Button label="*" onClick={() => handleOperatorClick('*')} />
          <Button label="1/x" onClick={handleReciprocal} />
          <Button label="1" onClick={() => handleDigitClick('1')} />
          <Button label="2" onClick={() => handleDigitClick('2')} />
          <Button label="3" onClick={() => handleDigitClick('3')} />
          <Button label="-" onClick={() => handleOperatorClick('-')} />
          <Button label="=" onClick={handleEqualsClick} className="bg-green-500 hover:bg-green-600 text-white row-span-2" />
          <Button label="0" onClick={() => handleDigitClick('0')} className="col-span-2" />
          <Button label="." onClick={handleDecimalClick} />
          <Button label="+" onClick={() => handleOperatorClick('+')} />
        </div>
      </div>
    </div>
  );
};