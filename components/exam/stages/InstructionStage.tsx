import Image from 'next/image'
import { UserData } from '../types'

interface Props {
    onNext: () => void
    user: UserData
}

export const InstructionStage = ({ onNext, user }: Props) => {
    return (
        <div className="max-h-screen bg-white font-sans text-sm text-gray-800 flex flex-col">
            {/* Top Header Strip */}
            <div className="bg-[#4F8CBD] text-white py-2 px-4 font-bold text-lg">
                Instructions
            </div>

            {/* Main Content Area: Left (Instructions) + Right (Profile) */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: Instructions Scrollable Area */}
                <div className="flex-1 overflow-y-auto border-r border-gray-300 custom-scrollbar">

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

                    {/* Next Button Footer inside the scrolling area */}
                    <div className="flex justify-end border-t-2 py-4 px-4 sticky bottom-0 bg-white">
                        <button
                            onClick={onNext}
                            className="bg-white border border-gray-300 hover:bg-gray-100 text-black px-8 py-1.5 rounded shadow-sm text-sm font-bold transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* RIGHT: User Profile Sidebar */}
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