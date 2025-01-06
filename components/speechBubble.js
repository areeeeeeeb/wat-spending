

export default function SpeechBubble({
    rotation = 0,
    text = 'Everyday I try really hard to be a good person. I really do.'
}) {
    return (
        <div className='flex flex-row items-center'>
            <div className="bg-white w-40 h-64 border border-black rounded-xl flex justify-center  items-center">
                <div className='absolute right-0 bg-white w-10 h-10 rotate-45 -translate-x-1/2'/>
                <p 
                    className="flex w-[90%] justify-center text-wrap break-all"
                    style={{
                        transform: `rotate(${-rotation}deg)`,
                        transformOrigin: "center",
                    }}
                > 
                    {text}
                </p>
            </div>
            <div className='bg-white w-10 h-10 rotate-45 border-r border-t border-black -translate-x-1/2'
                style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                }}
            />
        </div>
    )
}