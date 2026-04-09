"use client";

import React, { useState, useRef, ReactNode } from 'react';

interface WidgetItem {
    id: string;
    component: ReactNode;
    className: string;
}

interface Props {
    items: WidgetItem[];
    gridClass: string;
}

export function DashboardDraggableArea({ items, gridClass }: Props) {
    const [widgets, setWidgets] = useState<WidgetItem[]>(items);
    const draggingId = useRef<string | null>(null);
    const dragOverId = useRef<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        draggingId.current = id;
        e.dataTransfer.effectAllowed = 'move';
        // Minor visual feedback
        setTimeout(() => {
            const el = document.getElementById(`draggable-widget-${id}`);
            if (el) el.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragOverId.current = id;
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        const el = document.getElementById(`draggable-widget-${id}`);
        if (el) el.classList.remove('opacity-50');

        if (draggingId.current && dragOverId.current && draggingId.current !== dragOverId.current) {
            const newWidgets = [...widgets];
            const dragIndex = newWidgets.findIndex(w => w.id === draggingId.current);
            const dropIndex = newWidgets.findIndex(w => w.id === dragOverId.current);

            // Swap logic
            const dragged = newWidgets[dragIndex];
            newWidgets.splice(dragIndex, 1);
            newWidgets.splice(dropIndex, 0, dragged);

            setWidgets(newWidgets);
        }

        draggingId.current = null;
        dragOverId.current = null;
    };

    return (
        <div className={gridClass}>
            {widgets.map((widget) => (
                <div
                    key={widget.id}
                    id={`draggable-widget-${widget.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragEnter={(e) => handleDragEnter(e, widget.id)}
                    onDragEnd={(e) => handleDragEnd(e, widget.id)}
                    onDragOver={(e) => e.preventDefault()}
                    className={`cursor-grab active:cursor-grabbing transition-transform duration-200 transform hover:scale-[1.01] ${widget.className}`}
                >
                    <div className="absolute top-2 right-2 w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                        ::
                    </div>
                    {widget.component}
                </div>
            ))}
        </div>
    );
}
