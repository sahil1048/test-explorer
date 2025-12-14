import { X } from 'lucide-react'
import Image from 'next/image'
import { ExamData } from '../types'

export const InstructionModal = ({ exam, onClose }: { exam: ExamData, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="bg-[#4F8CBD] text-white py-2 px-4 font-bold text-lg flex justify-between items-center">
                    <span>Instructions</span>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Merged Instructions */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white text-black font-sans">

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

                    {/* SECTION 1: General Instructions */}


                    <hr className="my-6 border-gray-300" />

                    {/* SECTION 2: Specific Exam Details & Consent */}
                    <div className="overflow-auto md:p-4 p-2">
                        <h3 className="font-bold text-black text-base underline mb-4">General Instructions for Candidate:</h3>

                        <div className="space-y-4 leading-relaxed text-md text-black">
                            <div className="flex gap-2">
                                <span>1.</span>
                                <p>The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p>
                            </div>

                            <div className="flex gap-2">
                                <span>2.</span>
                                <p>The question paper will have a mix of Multiple Choice Question (MCQ) type with options and non-MCQ type.</p>
                            </div>

                            <div className="flex gap-2">
                                <span>3.</span>
                                <p>You will not be allowed to use any calculator or any other computing machine or device. An on-screen calculator will be provided, which can be used for computing.</p>
                            </div>

                            <div className="flex gap-2">
                                <p>4. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbol.</p>
                            </div>

                            <Image src="/instruction.png" alt="Question Palette Status Symbols" width={600} height={300} />

                            <div className="flex gap-2">
                                <p>*If a question is answered and ‘Marked for Review’ (Serial No. E), then the answer will be considered for evaluation unless the status is modified by the candidate.</p>
                            </div>

                            <div className="flex gap-2">
                                <span>5.</span>
                                <p>You can click on the "<strong>&lt;</strong>" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "<strong>&gt;</strong>" which appears on the right side of question window.</p>
                            </div>

                            {/* Section: How to answer */}
                            <div className="mt-6">
                                <h4 className="font-bold mb-2 text-black">6. To answer a question, do the following:</h4>
                                <div className="pl-4 space-y-3">
                                    <div className="flex gap-2">
                                        <span>a.</span>
                                        <p>Click on the question number in the Question Palette to go to that question directly.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>b.</span>
                                        <p>Select an answer for a multiple choice type question by clicking on the bubble placed before the choices in the form of radio buttons (o). For Non-MCQ questions, type in the answer in the space provided on the screen using the on-screen keyboard.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>c.</span>
                                        <p>Click on 'Save & Next' to save your answer for the current question and then go to the next question.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p>Alternatively you may click on Mark for Review & Next to save your answer for the current question and also to mark it for review, and then go to the next question.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>c.</span>
                                        <p>Caution: Your answer for the current question will not be saved, if you navigate directly to another question by clicking on a question number and not click ‘Save & Next’ or ‘Mark for Review & Next’ button.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>d.</span>
                                        <p>You will be able to view all the questions of a section by clicking on the ‘Question Paper’ button. This feature is provided for you to see the entire question paper by respective section</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <p>Changing the response:</p>
                            </div>

                            <div className="flex gap-2">
                                <p>7. Procedure for changing the response of a question:</p>
                            </div>

                            <div className="flex gap-2">
                                <p>a. To deselect your chosen answer, click on the question number on the palette and click on the ‘Clear Response’ button. <br />

                                    b. To change your chosen answer, click on the radio button corresponding to another option. <br />

                                    c. To save your changed answer, you MUST click on the ‘Save & Next’ or ‘Mark for Review & Next’ button.</p>
                            </div>

                            <div className="flex gap-2">
                                <p>8. Note that ONLY Questions for which answers are saved or marked for review after answering will be considered for evaluation.</p>
                            </div>

                            <div className="flex gap-2">
                                <p>9. Sections in this question paper are displayed on the top bar of the screen. Questions in a Section can be viewed by clicking on the name of that Section. The Section you are currently viewing will be highlighted.</p>
                            </div>

                            <div className="flex gap-2">
                                <p>10. After clicking the Save & Next button for the last question in a Section, you will automatically be taken to the first question of the same Section in sequence.</p>
                            </div>

                            <div className="flex gap-2">
                                <p>11. You can move the mouse cursor over the name of a Section to view the answering status for that Section.</p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer Close Button */}
                <div className="p-4 border-t border-gray-300 bg-gray-50 flex justify-center">
                    <button onClick={onClose} className="px-6 py-2 bg-[#337AB7] text-white rounded font-bold hover:bg-[#286090]">
                        Close Instructions
                    </button>
                </div>
            </div>
        </div>
    )
}