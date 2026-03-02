export interface DragItem {
  type: 'todo';
  id: string;
  data: any;
}

export function handleDragStart(event: React.DragEvent<HTMLElement>, item: DragItem) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/json', JSON.stringify(item));
}

export function handleDragOver(event: React.DragEvent<HTMLElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export function handleDrop(event: React.DragEvent<HTMLElement>): DragItem | null {
  event.preventDefault();
  
  try {
    const data = event.dataTransfer.getData('application/json');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export function getDropTarget(event: React.DragEvent<HTMLElement>): Date | null {
  const target = event.currentTarget;
  const dataDate = target.getAttribute('data-date');
  
  if (dataDate) {
    return new Date(dataDate);
  }
  
  return null;
}
