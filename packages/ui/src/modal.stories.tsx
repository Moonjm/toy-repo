import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    open: true,
    title: 'Modal Title',
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    children: (
      <p className="text-sm text-slate-600">This is a basic modal with a title and close button.</p>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    children: (
      <div className="text-center py-4">
        <p className="text-sm text-slate-600">Modal without a title header.</p>
      </div>
    ),
  },
};

export const SmallWidth: Story = {
  args: {
    maxWidth: 'sm',
    children: <p className="text-sm text-slate-600">A narrower modal using max-w-sm.</p>,
  },
};

export const Interactive: Story = {
  render: function InteractiveModal() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Open Modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Interactive Modal">
          <p className="text-sm text-slate-600">Click the X or overlay to close.</p>
        </Modal>
      </>
    );
  },
};
