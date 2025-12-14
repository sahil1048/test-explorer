import Image from 'next/image'
import { useState } from 'react'
import { ExamData, UserData } from '../types'

interface Props {
    exam: ExamData
    user: UserData
    onPrev: () => void
    onStart: () => void
}

export const ConsentStage = ({ exam, user, onPrev, onStart }: Props) => {
    const [agreed, setAgreed] = useState(false)

    return (
        <div className="max-h-screen bg-white font-sans text-sm text-black flex flex-col">
            {/* Top Header Strip - Light Blue */}
            <div className="bg-[#4F8CBD] text-white py-2 px-4 font-bold text-lg">
                Instructions
            </div>

            <div className="flex flex-1 overflow-hidden max-h-full">

                {/* LEFT: Main Content */}
                <div className="flex-1 flex flex-col border-r border-gray-400 min-w-0">
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">

                        <div className="flex justify-between items-center py-1.5 font-bold text-black text-xs md:text-sm bg-white">
                            <span>Duration: {exam.duration_minutes || 60} Mins</span>
                            <span>Maximum Marks : {exam.total_marks || 200}</span>
                        </div>

                        <h3 className="font-bold text-black mb-4">Read the following instructions carefully.</h3>

                        <ol className="list-decimal pl-5 space-y-2 mb-6 text-black">
                            <li>The Test contains {exam.total_questions || '50'} questions.</li>
                            <li>Each question has 4 options out of which only one is correct.</li>
                            <li>You have to finish the test in {exam.duration_minutes || 60} minutes.</li>
                            <li>You will be awarded marks for correct answers. There is {exam.negative_marking ? 'negative marking' : 'no penalty'} for incorrect answers.</li>
                            <li>There is no penalty for the questions that you have not attempted.</li>
                            <li>Once you start the test, you will not be allowed to reattempt it. Make sure that you complete the test before you submit the test and/or close the browser.</li>
                        </ol>

                        <h3 className="font-bold text-black mb-2 underline">About Question Paper:</h3>
                        <div className="space-y-4 text-black leading-relaxed">
                            <div className="flex gap-2">
                                <span>1.</span>
                                <p>The Question Paper consists of multiple choice objective type questions with 4 options out of which only one is correct.</p>
                            </div>
                            <div className="flex gap-2">
                                <span>2.</span>
                                <p>There is a TIMER (Clock) available on the TOP RIGHT HAND CORNER of the Screen; you are requested to keep an eye on it for knowing the time remaining for the completion of the exam.</p>
                            </div>
                            <div className="flex gap-2">
                                <span>3.</span>
                                <p>The questions can be answered in any order within the given time frame. The candidate should click with the mouse on the correct choice, from 4 options given. In case, the candidate does not wish to attempt any question, it can be left blank.</p>
                            </div>
                            <div className="flex gap-2">
                                <span>4.</span>
                                <p>The candidate can change the option of a question later by selecting a new option in case he/she wishes to. In case candidate does not want to answer the question, he/she can deselect the answer by clicking <span className="border border-gray-400 bg-gray-100 px-1 text-xs mx-1 font-bold">Clear</span> provided against the question.</p>
                            </div>

                            <div className="flex gap-2">
                                <span>5.</span>
                                <div>
                                    <p className="mb-2">The question palette at the right of the screen shows the following status of each of the questions numbered</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>You have not answered the question.</li>
                                        <li>You have answered the question.</li>
                                        <li>You have NOT answered the question, but have marked the question for review.</li>
                                        <li>You have answered the question, but marked it for review.</li>
                                    </ul>
                                    <p className="mt-4 font-bold">
                                        PS: Questions which are attempted and marked for review would be treated as attempted questions only as long as the candidate does not <span className="border border-gray-400 bg-gray-100 px-1 text-xs mx-1 font-normal">Clear</span> the option selected.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <span>6.</span>
                                <p>On the completion of the test duration, even if the candidate does not click on an answer or does not click on the <span className="border border-gray-400 bg-gray-100 px-1 text-xs mx-1 font-bold">Submit Test</span> button, a NIL result will be saved automatically by the computer.</p>
                            </div>

                            <div className="flex gap-2">
                                <span>7.</span>
                                <p>The candidate will only be able to submit the test on completion of the stipulated {exam.duration_minutes || 60} Minutes. In case a candidate not completed his/her test at the completion of stipulated {exam.duration_minutes || 60} Minutes, the system shall automatically submit the test.</p>
                            </div>

                            <div className="text-center font-bold mt-8 mb-4">
                                "ALL THE BEST"
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer Area - Disclaimer & Buttons */}
                    <div className="p-4 border-t border-gray-300 bg-white z-10">

                        {/* Disclaimer Text */}
                        <div className="mb-6">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded-none border-gray-400 accent-[#2D8BBA] shrink-0"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <span className="text-black text-sm leading-tight">
                                    I have read and understood all the above instructions. I have also read and understood clearly the instructions given on the admit card and shall follow the same. I also understand that in case I am found to violate any of these instructions, my candidature is liable to be cancelled. I also confirm that at the start of the test all the computer hardware allotted to me are in proper working condition.
                                </span>
                            </label>
                            <p className="text-black text-sm pl-6 mt-3 leading-tight">
                                I will not disclose, publish, reproduce, transmit, store, or facilitate transmission and storage of the contents of the Test or any information therein in whole or part thereof in any form or by any means, verbal or written, electronically or mechanically for any purpose. I agree to this Non-Disclosure Agreement.
                            </p>
                        </div>

                        {/* Buttons Row - Centered with correct styling */}
                        <div className="flex justify-end items-center gap-4 pt-2">
                            <button
                                onClick={onPrev}
                                className="px-6 py-2 border border-gray-300 rounded-sm bg-linear-to-b from-white to-gray-50 hover:bg-gray-100 font-bold text-black text-sm shadow-sm"
                            >
                                Previous
                            </button>

                            <button
                                onClick={() => agreed && onStart()}
                                disabled={!agreed}
                                className={`px-8 py-2 rounded-sm text-white font-bold text-sm shadow-sm transition-all
                      ${agreed
                                        ? 'bg-[#68C1EF] hover:bg-[#5aaud6] border border-[#68C1EF] cursor-pointer' // Sky blue color match
                                        : 'bg-[#68C1EF] opacity-50 cursor-not-allowed border border-[#68C1EF]'}
                    `}
                            >
                                I am ready to begin
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT: User Profile Sidebar - Reused from Instructions */}
                <div className="w-64 bg-white border-l border-gray-300 flex flex-col items-center p-8 shrink-0">
                    {/* User Icon */}
                    <Image
                        src="/avatar.png"
                        alt="User Icon"
                        width={80}
                        height={80}
                        className="rounded-full mb-4"
                    />

                    {/* User Name */}
                    <div className="text-center font-bold text-black text-lg">
                        {user?.user_metadata?.full_name || "Sahil Mor"}
                    </div>
                </div>

            </div>
        </div>
    )
}