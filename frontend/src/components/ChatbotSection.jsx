import chat1 from "../assets/chat1.jpg"
import chat2 from "../assets/chat2.jpg"
import chat3 from "../assets/chat3.jpg"


function hatbotSection() {
    return (
        <section id="assistant" className="h-screen pt-20 flex flex-col items-center text-center" aria-labelledby="assistant-heading">
            <h2 className="text-md uppercase tracking-[0.4em] text-muted">
                SHOP WITH CLARITY
            </h2>

            <h3 id="assistant-heading" className="mt-3 text-5xl lg:text-7xl font-cormorant font-bold text-foreground">
                Your personal AI Assistant.
            </h3>

            <p className="mt-4 mb-4 max-w-2xl mx-auto text-muted">
                Describe what you need. Our AI analyzes performance specs, compatibility, and pricing to curate your ideal setup.
            </p>

            <div className="mb-8 flex gap-5">
                <div className="lg:flex lg:gap-5">
                    <div className="flex gap-2 mt-5 text-muted hover:text-foreground duration-300 ease-in-out font-playfair tracking-wide text-2xl cursor-pointer items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <p>Tailored to your exact workflow</p>
                    </div>

                    <div className="flex gap-2 mt-5 text-muted hover:text-foreground duration-300 ease-in-out font-playfair tracking-wide text-2xl cursor-pointer items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <p>Objective, side-by-side comparisons</p>
                    </div>
                </div>

                <div className="lg:flex lg:gap-5">
                    <div className="flex gap-2 mt-5 text-muted hover:text-foreground duration-300 ease-in-out font-playfair tracking-wide text-2xl cursor-pointer items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <p>Clear technical breakdowns</p>
                    </div>

                    <div className="flex gap-2 mt-5 text-muted hover:text-foreground duration-300 ease-in-out font-playfair tracking-wide text-2xl cursor-pointer items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <p>Optimized for your budget</p>
                    </div>
                </div>
            </div>

            <div className="bg-primary-hover text-inverse text-xl font-bold px-10 py-2 rounded-full shadow-elevated hover:scale-[1.02] duration-300 linear cursor-pointer">
                Consult Your AI
            </div>

            <div className="flex mt-10 gap-8">
                <div className="lg:w-[25vw] md:w-[30vw] border border-border-soft rounded-2xl overflow-hidden shadow-elevated hover:scale-[1.02] duration-300 linear">
                    <img src={chat1}
                        alt="AI assistant chat"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="lg:w-[25vw] md:w-[30vw] border border-border-soft rounded-2xl overflow-hidden shadow-elevated hover:scale-[1.02] duration-300 linear">
                    <img src={chat3}
                        alt="AI assistant comparison"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="lg:w-[25vw] md:w-[30vw] border border-border-soft rounded-2xl overflow-hidden shadow-elevated hover:scale-[1.02] duration-300 linear">
                    <img src={chat2}
                        alt="AI assistant recommendation"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            <h4 className="
                mt-12
                text-3xl lg:hidden md:block
                font-cormorant
                border-b border-border tracking-wider
                text-foreground
            ">
                The right technology starts with the right advice.
            </h4>
        </section>
    )
}

export default ChatbotSection;
