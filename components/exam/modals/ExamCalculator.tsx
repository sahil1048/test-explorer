import { useState } from 'react'
import { 
  Minus,
  X,
} from 'lucide-react'

export const ExamCalculator = ({ onClose }: { onClose: () => void }) => {
  const [current, setCurrent] = useState('0'); // Bottom field (current number)
  const [expression, setExpression] = useState(''); // Top field (logic history)
  const [isResult, setIsResult] = useState(false); // Flag to check if current display is a result
  const [memory, setMemory] = useState<number>(0);

  // --- LOGIC HANDLERS ---

  const handleDigit = (digit: string) => {
    if (isResult) {
      setCurrent(digit);
      setExpression('');
      setIsResult(false);
    } else {
      setCurrent(current === '0' ? digit : current + digit);
    }
  };

  const handleOperator = (op: string) => {
    setIsResult(false);
    // If expression ends with an operator and we haven't typed a new number, replace operator
    // Otherwise, append current number and operator to expression
    if (expression.endsWith(' ') && current === '0') {
        // Edge case: changing operator
        setExpression(expression.slice(0, -3) + ` ${op} `);
    } else {
        setExpression(expression + `${current} ${op} `);
    }
    setCurrent('0');
  };

  const handleEqual = () => {
    try {
      // Create the full formula string (e.g., "87 + 3")
      const finalExpression = expression + current;
      
      // Calculate safely
      // Note: We use Function() instead of eval() for slightly better security, 
      // though input is restricted to buttons anyway.
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + finalExpression)();
      
      // Update UI
      setExpression(finalExpression); // Top shows "87 + 3"
      setCurrent(String(result));     // Bottom shows "90"
      setIsResult(true);
      setExpression(''); // Reset expression for next calculation flow if user continues typing
    } catch (error) {
      setCurrent('Error');
    }
  };

  const handleClear = () => {
    setCurrent('0');
    setExpression('');
    setIsResult(false);
  };

  const handleBackspace = () => {
    if (isResult) {
        handleClear();
    } else {
        setCurrent(current.length > 1 ? current.slice(0, -1) : '0');
    }
  };

  const handleDecimal = () => {
    if (isResult) {
      setCurrent('0.');
      setIsResult(false);
      setExpression('');
    } else if (!current.includes('.')) {
      setCurrent(current + '.');
    }
  };

  const handleSign = () => {
    setCurrent(String(parseFloat(current) * -1));
  };

  const handleSqrt = () => {
    const val = parseFloat(current);
    if (val >= 0) setCurrent(String(Math.sqrt(val)));
  };

  // Memory Functions
  const handleMemory = (action: string) => {
    const val = parseFloat(current);
    switch (action) {
      case 'MC': setMemory(0); break;
      case 'MR': setCurrent(String(memory)); setIsResult(true); break;
      case 'MS': setMemory(val); setIsResult(true); break;
      case 'M+': setMemory(memory + val); setIsResult(true); break;
      case 'M-': setMemory(memory - val); setIsResult(true); break;
    }
  };

  // --- UI COMPONENTS ---

  const CalcButton = ({ label, onClick, className = '', active = false }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }} // Prevent form submission if inside a form
      className={`
        border border-gray-400 rounded-[2px] text-xs font-bold py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]
        active:translate-y-px active:shadow-none transition-all
        ${className}
        ${active ? 'bg-yellow-200' : 'bg-linear-to-b from-[#f0f0f0] to-[#dcdcdc] text-black hover:from-[#e8e8e8] hover:to-[#d0d0d0]'}
      `}
    >
      {label}
    </button>
  );

  return (
    <div 
      className="absolute top-28 right-1/8 -translate-x-1/2 z-50 w-[280px] bg-[#CECECE] border-[3px] border-[#808080] rounded shadow-2xl font-sans select-none"
      style={{ boxShadow: '5px 5px 15px rgba(0,0,0,0.5)' }}
    >
      {/* Header */}
      <div className="bg-[#337AB7] text-white px-2 py-1 flex justify-between items-center h-8 cursor-move">
        <span className="font-medium text-sm">Normal Calculator</span>
        <div className="flex gap-1">
            {/* Fake Minimize Button */}
            <button className="text-white hover:bg-blue-600 rounded p-0.5"><Minus size={14} /></button> 
            {/* Close Button */}
            <button onClick={onClose} className="text-white hover:bg-red-500 rounded p-0.5"><X size={14} /></button>
        </div>
      </div>

      {/* Display Area */}
      <div className="p-3 pb-2 space-y-2">
         {/* Top Field: Expression / Logic */}
         <div className="bg-white border border-[#808080] h-8 px-2 flex items-center justify-end text-sm text-gray-600 overflow-hidden whitespace-nowrap shadow-inner">
           {expression + (isResult ? '' : (current === '0' && expression ? '' : ''))}
         </div>
         
         {/* Bottom Field: Current Input / Result */}
         <div className="bg-white border border-[#808080] h-9 px-2 flex items-center justify-end text-xl font-bold text-black overflow-hidden shadow-inner">
           {current}
         </div>
      </div>

      {/* Buttons Grid */}
      <div className="p-3 pt-0">
        <div className="grid grid-cols-5 gap-1.5">
          {/* Row 1 */}
          <CalcButton label="MC" onClick={() => handleMemory('MC')} className="text-red-700" />
          <CalcButton label="MR" onClick={() => handleMemory('MR')} />
          <CalcButton label="MS" onClick={() => handleMemory('MS')} />
          <CalcButton label="M+" onClick={() => handleMemory('M+')} />
          <CalcButton label="M-" onClick={() => handleMemory('M-')} />

          {/* Row 2 */}
          <CalcButton label="BackSpace" onClick={handleBackspace} className="col-span-2 text-red-700" />
          <CalcButton label="C" onClick={handleClear} className="text-red-700" />
          <CalcButton label="+/-" onClick={handleSign} />
          <CalcButton label="√" onClick={handleSqrt} />

          {/* Row 3 */}
          <CalcButton label="7" onClick={() => handleDigit('7')} className="font-black" />
          <CalcButton label="8" onClick={() => handleDigit('8')} className="font-black" />
          <CalcButton label="9" onClick={() => handleDigit('9')} className="font-black" />
          <CalcButton label="/" onClick={() => handleOperator('/')} />
          <CalcButton label="%" onClick={() => {}} /> {/* % usually not standard on simple exam calc, keeping layout */}

          {/* Row 4 */}
          <CalcButton label="4" onClick={() => handleDigit('4')} className="font-black" />
          <CalcButton label="5" onClick={() => handleDigit('5')} className="font-black" />
          <CalcButton label="6" onClick={() => handleDigit('6')} className="font-black" />
          <CalcButton label="*" onClick={() => handleOperator('*')} />
          <CalcButton label="1/x" onClick={() => { if(parseFloat(current)!==0) setCurrent(String(1/parseFloat(current))) }} />

          {/* Row 5 */}
          <CalcButton label="1" onClick={() => handleDigit('1')} className="font-black" />
          <CalcButton label="2" onClick={() => handleDigit('2')} className="font-black" />
          <CalcButton label="3" onClick={() => handleDigit('3')} className="font-black" />
          <CalcButton label="-" onClick={() => handleOperator('-')} />
          
          {/* Equals Button - Tall (Row Span 2) */}
          <button 
             onClick={handleEqual}
             className="bg-[#5CB85C] border border-gray-400 text-white font-bold rounded-[2px] shadow-sm row-span-2 flex items-center justify-center text-lg active:translate-y-1px"
          >
            =
          </button>

          {/* Row 6 */}
          <CalcButton label="0" onClick={() => handleDigit('0')} className="col-span-2 font-black" />
          <CalcButton label="." onClick={handleDecimal} />
          <CalcButton label="+" onClick={() => handleOperator('+')} />
        </div>
      </div>
    </div>
  );
};