import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { playTapSound, playCorrectSound } from '../utils/audio';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'สวัสดีครับ ยินดีต้อนรับสู่ผู้ช่วยวิชาการประจำหอวิชาการนาฏศิลป์ไทย คุณสามารถสอบถามเกี่ยวกับประวัติศาสตร์ ๑๐ บทเรียน ภาษาท่า เพลงหน้าพาทย์ เครื่องแต่งกาย หรือขอคำอธิบายข้อสอบ ๑,๐๐๐ ข้อได้เลยครับ!',
    timestamp: 'เมื่อสักครู่'
  }
];

const SUGGESTED_QUERIES = [
  'สรุปประเภทการแสดง ๔ แบบ',
  'เพลงหน้าพาทย์ชั้นสูงมีอะไรบ้าง?',
  'ความแตกต่างระหว่างละครในกับละครนอก',
  'ท่าจีบมีกี่ประเภท และจีบล่อแก้วทำอย่างไร?',
  'โขนพระราชทานมีความสำคัญอย่างไร?'
];

export const AiChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (forcedText?: string) => {
    const textToSend = (forcedText || inputText).trim();
    if (!textToSend || isThinking) return;

    playTapSound();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Call Cloudflare Worker endpoint / AI fallback
    try {
      const res = await fetch('https://natasin.tontakankeawpang.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })).concat([{ role: 'user', parts: [{ text: textToSend }] }])
        })
      });

      let replyText = "";
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply || generateScholarlyReply(textToSend);
      } else {
        replyText = generateScholarlyReply(textToSend);
      }

      playCorrectSound();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch {
      const fallbackReply = generateScholarlyReply(textToSend);
      playCorrectSound();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const generateScholarlyReply = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('โขน')) {
      return 'โขน เป็นศิลปะการแสดงชั้นสูงของไทยที่ผู้แสดงสวมหัวโขนปิดหน้า (ยกเว้นตัวพระ นาง และเทวดา) แสดงเฉพาะเรื่องรามเกียรติ์ มีผู้พากย์และเจรจาแทนผู้แสดง แบ่งเป็น ๕ ประเภทตามวิวัฒนาการ ได้แก่ โขนกลางแปลง, โขนนั่งราว, โขนโรงใน, โขนหน้าจอ และโขนฉาก ได้รับการขึ้นทะเบียน UNESCO เป็นมรดกโลกปี ๒๕๖๑ ครับ';
    }
    if (q.includes('เพลงหน้าพาทย์') || q.includes('หน้าพาทย์')) {
      return 'เพลงหน้าพาทย์ คือ เพลงดนตรีไทยที่บรรเลงโดยไม่มีคำร้อง ใช้วงปี่พาทย์บรรเลงเพื่อประกอบกิริยา อาการ อารมณ์ และอภินิหารของตัวละคร แบ่งเป็น ๓ ระดับ: ๑) หน้าพาทย์ธรรมดา เช่น เพลงเสมอ (เดินระยะใกล้), เพลงเชิด (เดินทางเร็ว/รบ), เพลงโอด (เศร้าโศก) ๒) หน้าพาทย์ชั้นกลาง เช่น เพลงเสมอมาร ๓) หน้าพาทย์ชั้นสูง เช่น เพลงตระนิมิต และเพลงองค์พระพิราพ ครับ';
    }
    if (q.includes('นาฏยศัพท์') || q.includes('จีบ') || q.includes('วง')) {
      return 'นาฏยศัพท์ คือ ศัพท์เฉพาะที่ใช้เรียกกิริยาท่าทางและระเบียบร่างกายทางนาฏศิลป์ เช่น การจีบ (จีบหงาย, จีบคว่ำ, จีบปรกหน้า, จีบปรกข้าง, จีบล่อแก้ว) และการตั้งวง (วงบน, วงกลาง, วงล่าง) ส่วน "ภาษาท่า" คือการนำนาฏยศัพท์มาร้อยเรียงเพื่อสื่อความหมายและอารมณ์แทนคำพูดครับ';
    }
    if (q.includes('ละครใน') || q.includes('ละครนอก')) {
      return 'ความแตกต่างสำคัญ: "ละครใน" แสดงในพระราชวัง ใช้นักแสดงหญิงล้วน ท่ารำประณีต เล่นเพียง ๓ เรื่อง (อิเหนา, รามเกียรติ์, อุณรุท) ส่วน "ละครนอก" กำเนิดนอกวัง ใช้นักแสดงชายล้วน เน้นความสนุกสนาน รวดเร็ว และสอดแทรกมุกตลกครับ';
    }
    if (q.includes('ไหว้ครู') || q.includes('ครอบครู')) {
      return 'พิธีไหว้ครูนาฏศิลป์ไทยจัดขึ้นใน "วันพฤหัสบดี" เพื่อแสดงความกตัญญูกตเวทิตาต่อบูรพาจารย์ ทั้งครูเทพ (พระอิศวร, พระภรตมุนี, พระพิฆเนศ, พระพิราพ) และครูมนุษย์ โดยการ "ครอบครู" เป็นการประสิทธิ์ประสาทวิชาให้ศิษย์สามารถรำเพลงหน้าพาทย์ชั้นสูงและถ่ายทอดวิชาต่อไปได้ครับ';
    }
    return `ขอบคุณสำหรับคำถามเกี่ยวกับ "${query}" ครับ ในระบบหอวิชาการนาฏศิลป์ไทย ข้อมูลเรื่องนี้จัดอยู่ในหลักสูตรแกนกลาง สามารถเปิดอ่านสรุปในหน้าหลัก หรือฝึกทำข้อสอบประจำบทที่เกี่ยวข้อง (บทละ ๑๐๐ ข้อ) เพื่อความแม่นยำยิ่งขึ้นได้ครับ!`;
  };

  const handleClearHistory = () => {
    playTapSound();
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[75vh] max-h-[680px]">
        
        {/* Header Bar (Light Theme) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-bold text-lg shadow-2xs">
              🤖
            </div>
            <div>
              <h3 className="font-bold font-display text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                <span>ผู้ช่วย AI วิชาการนาฏศิลป์</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <span className="text-[11px] text-slate-500 font-body">
                ระบบปัญญาประดิษฐ์ให้คำปรึกษาและเฉลยโจทย์ตลอด ๒๔ ชม.
              </span>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors shadow-2xs"
            title="ล้างประวัติสนทนา"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 no-scrollbar">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed font-body shadow-2xs ${
                    isAi
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      : 'bg-amber-600 text-white font-medium rounded-tr-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`block text-[10px] mt-1.5 ${isAi ? 'text-slate-400' : 'text-amber-100'} text-right`}>
                    {m.timestamp}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 font-display">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>ผู้ช่วย AI กำลังสืบค้นตำราวิชาการ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-display">
          <span className="text-slate-500 shrink-0 text-[11px] flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-600" />
            ตัวอย่าง:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-3 py-1 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors text-[11px] shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-all"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถามทางวิชาการนาฏศิลป์ หรือขอให้อธิบายข้อสอบ..."
              className="flex-1 bg-transparent border-none py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-body"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shrink-0 transition-all shadow-xs disabled:opacity-30 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
