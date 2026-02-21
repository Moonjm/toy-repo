import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    children: <PlusIcon />,
    variant: 'ghost',
    size: 'md',
    radius: 'lg',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'accent', 'secondary', 'ghost', 'danger', 'none'],
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    radius: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Accent: Story = {
  args: { variant: 'accent' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const FullRadius: Story = {
  args: { radius: 'full' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton variant="primary">
        <PlusIcon />
      </IconButton>
      <IconButton variant="accent">
        <PlusIcon />
      </IconButton>
      <IconButton variant="secondary">
        <PlusIcon />
      </IconButton>
      <IconButton variant="ghost">
        <PlusIcon />
      </IconButton>
      <IconButton variant="danger">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton size="xs">
        <PlusIcon />
      </IconButton>
      <IconButton size="sm">
        <PlusIcon />
      </IconButton>
      <IconButton size="md">
        <PlusIcon />
      </IconButton>
      <IconButton size="lg">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};
