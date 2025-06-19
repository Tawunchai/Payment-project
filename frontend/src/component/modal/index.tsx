import { useState } from 'react'
import Modal from "./modal"

const index = () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className='p-10 flex justify-center w-full mt-24'>
            <button onClick={() => setOpen(true)} className='border border-neutral-300 rounded-lg p-1.5 px-10 my-2 bg-blue-500 hover:bg-blue-600 text-white'>
                Open
            </button>
            <Modal open={open} onClose = {()=> setOpen(false)} >
                <div className='flex flex-col gap-4'></div>
                <h1 className='text-2xl'>Modal Title</h1>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur itaque natus quos veniam commodi ipsa obcaecati doloremque impedit aliquid ea, libero fugiat consequuntur asperiores cumque, blanditiis accusamus, deleniti ex. Labore.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi tempora minima unde eligendi ab ratione natus. Consequuntur sit consectetur tempore voluptatem tempora numquam cupiditate, error deserunt maxime officia reiciendis eum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia voluptas ratione consectetur possimus voluptatibus delectus a, pariatur eum est dolor quaerat placeat, maxime voluptatum, tenetur iure minus? Magni, modi minus?</p>
                <hr className='border-t-solid border-1 border-gray'/>
                <div className='flex flex-row justify-center'>
                    <button className='border border-neutral-300 rounded-lg py-1.5 px-10 bg-blue-500 hover:bg-blue-600 text-white' onClick={() => setOpen(false)}>

                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default index