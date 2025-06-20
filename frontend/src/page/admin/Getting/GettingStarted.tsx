import { useState } from "react";
import Modal from "./modal"
import { Trash2 } from "react-feather";

const GettingStarted = () => {
  const [open, setOpen] = useState(false)
  return (
    <main className="App">
      <button className="btn btn-danger" onClick={() => setOpen(true)}>
        <Trash2 /> Delete
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="text-center w-56">
          <Trash2 size={56} className="mx-auto text-red-500" />
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">Confirm Delete</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this item?
            </p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-danger w-full">Delete</button>
            <button
              className="btn btn-light w-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}

export default GettingStarted