/**
 * DragDropManager.ts
 * Advanced drag-and-drop manager with undo/redo support
 * Supports touch events, dynamic previews, and reordering
 */

export interface DragItem {
  id: string;
  type: 'field' | 'section' | 'page';
  index: number;
  data: any;
}

export interface DragDropState {
  items: DragItem[];
  activeId?: string;
  history: DragDropState[];
  historyIndex: number;
}

export class DragDropManager {
  private state: DragDropState;
  private listeners: Set<(state: DragDropState) => void> = new Set();
  private draggingItem: DragItem | null = null;
  private overIndex: number | null = null;

  constructor(initialItems: DragItem[] = []) {
    this.state = {
      items: initialItems,
      history: [],
      historyIndex: -1,
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: DragDropState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all subscribers of state change
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  /**
   * Drag start handler
   */
  handleDragStart(item: DragItem) {
    this.draggingItem = item;
    this.state.activeId = item.id;
    this.notifyListeners();
  }

  /**
   * Drag over handler
   */
  handleDragOver(overIndex: number) {
    this.overIndex = overIndex;
    this.notifyListeners();
  }

  /**
   * Drop handler with reordering
   */
  handleDrop() {
    if (!this.draggingItem || this.overIndex === null) return;

    const items = [...this.state.items];
    const dragIndex = items.findIndex((item) => item.id === this.draggingItem!.id);

    if (dragIndex === -1 || dragIndex === this.overIndex) {
      this.resetDragState();
      return;
    }

    // Reorder items
    const draggedItem = items[dragIndex];
    items.splice(dragIndex, 1);
    items.splice(this.overIndex, 0, draggedItem);

    // Update indices
    items.forEach((item, idx) => (item.index = idx));

    this.saveState(items);
    this.resetDragState();
  }

  /**
   * Handle drag end
   */
  handleDragEnd() {
    this.resetDragState();
  }

  /**
   * Reset drag state
   */
  private resetDragState() {
    this.draggingItem = null;
    this.overIndex = null;
    this.state.activeId = undefined;
    this.notifyListeners();
  }

  /**
   * Add new item
   */
  addItem(item: DragItem) {
    const items = [
      ...this.state.items,
      { ...item, index: this.state.items.length },
    ];
    this.saveState(items);
  }

  /**
   * Remove item by ID
   */
  removeItem(id: string) {
    const items = this.state.items
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, index: idx }));
    this.saveState(items);
  }

  /**
   * Update item data
   */
  updateItem(id: string, updates: Partial<DragItem>) {
    const items = this.state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.saveState(items);
  }

  /**
   * Save state and add to history
   */
  private saveState(items: DragItem[]) {
    // Remove any redo history if we make a new change
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    }

    // Add current state to history
    this.state.history.push({
      items: this.state.items,
      history: [],
      historyIndex: -1,
    });

    this.state.items = items;
    this.state.historyIndex = this.state.history.length - 1;
    this.notifyListeners();
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.state.historyIndex <= 0) return false;

    this.state.historyIndex--;
    const previousState = this.state.history[this.state.historyIndex];
    this.state.items = previousState.items;
    this.notifyListeners();
    return true;
  }

  /**
   * Redo last undone action
   */
  redo() {
    if (this.state.historyIndex >= this.state.history.length - 1) return false;

    this.state.historyIndex++;
    const nextState = this.state.history[this.state.historyIndex];
    this.state.items = nextState.items;
    this.notifyListeners();
    return true;
  }

  /**
   * Get current state
   */
  getState(): DragDropState {
    return { ...this.state };
  }

  /**
   * Check if can undo
   */
  canUndo(): boolean {
    return this.state.historyIndex > 0;
  }

  /**
   * Check if can redo
   */
  canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  /**
   * Get dragging item for preview
   */
  getDraggingItem(): DragItem | null {
    return this.draggingItem;
  }

  /**
   * Get over index for drop preview
   */
  getOverIndex(): number | null {
    return this.overIndex;
  }
}
