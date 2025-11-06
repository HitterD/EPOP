# Workflow Automation UI Builder

## Overview

The Workflow Automation UI provides a visual node-based editor for creating automated workflows. Users can drag and drop triggers, conditions, and actions to build complex automation rules without writing code.

## Features

### Wave-3 (Planned)
- **Node-based Canvas**: Visual editor using dnd-kit
- **Node Palette**: Draggable trigger/condition/action nodes
- **Wire Connections**: Drag to connect nodes
- **Node Types**:
  - **Triggers**: "Task created", "Message mentioned me", "Event due in X hours"
  - **Conditions**: "If task priority = high", "If sender is...", "If time is..."
  - **Actions**: "Send email", "Create task", "Move to bucket", "Notify user"
- **Node Inspector**: Configure node properties (JSON schema-based forms)
- **DAG Validation**: Prevent cycles, validate connections
- **Test Run**: Simulate workflow with mock data
- **Draft/Active States**: Save as draft or activate workflow

### Wave-4 (Future)
- **Conditional Branching**: If/else paths
- **Variables**: Store and reuse data
- **Scheduled Triggers**: Run at specific times
- **Webhook Triggers**: External HTTP triggers
- **Error Handling**: Retry logic, fallback actions

## File Locations

```
app/(shell)/automation/page.tsx                # Workflow list
app/(shell)/automation/[id]/edit/page.tsx      # Editor
features/automation/components/                # Components
lib/api/hooks/use-workflows.ts                # API hooks
```

## Backend Contract

### Workflow CRUD

```
GET /api/v1/workflows
POST /api/v1/workflows
PUT /api/v1/workflows/:id
DELETE /api/v1/workflows/:id

Body (POST/PUT):
{
  name: string,
  description?: string,
  status: 'draft' | 'active',
  definition: {
    nodes: Array<{
      id: string,
      type: 'trigger' | 'condition' | 'action',
      nodeType: string,
      config: Record<string, any>,
      position: { x: number, y: number }
    }>,
    edges: Array<{
      id: string,
      source: string,
      target: string
    }>
  }
}
```

### Test Workflow

```
POST /api/v1/workflows/run:test
Body:
{
  workflowId: string,
  mockData?: Record<string, any>
}

Response:
{
  success: boolean,
  steps: Array<{
    nodeId: string,
    status: 'success' | 'failed',
    duration: number
  }>
}
```

## Component Architecture

### Workflow Canvas

Uses dnd-kit for drag-and-drop node placement and connection:

```typescript
function WorkflowCanvas() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  
  const handleDragEnd = (event: DragEndEvent) => {
    // Add node to canvas
    const newNode = {
      id: nanoid(),
      type: event.active.data.type,
      config: {},
      position: { x: event.delta.x, y: event.delta.y }
    }
    setNodes([...nodes, newNode])
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <NodePalette />
      <Canvas nodes={nodes} edges={edges} />
      <NodeInspector />
    </DndContext>
  )
}
```

### DAG Validation

Prevents cycles using depth-first search:

```typescript
function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: WorkflowEdge[]
): boolean {
  const graph = buildAdjacencyList(edges)
  graph.get(sourceId)?.push(targetId)
  
  return detectCycle(graph, sourceId)
}
```

### Node Inspector

Auto-generates forms from JSON schemas:

```typescript
function NodeInspector({ node, onChange }) {
  const schema = getSchemaForNodeType(node.nodeType)
  const form = useForm({ resolver: zodResolver(schema) })
  
  return (
    <Form {...form}>
      <AutoFormFields schema={schema} />
      <Button type="submit">Update</Button>
    </Form>
  )
}
```

## Accessibility

- Full keyboard navigation
- Screen reader announcements for node connections
- ARIA labels on all interactive elements

## Testing

### E2E Tests

```typescript
test('Create workflow', async ({ page }) => {
  await page.goto('/automation/new')
  
  // Drag trigger to canvas
  await page.dragAndDrop('[data-node="task_created"]', '[data-canvas]')
  
  // Configure node
  await page.click('[data-node-id="node-1"]')
  await page.fill('[name="projectId"]', 'project-1')
  
  // Save workflow
  await page.click('[data-testid="save-workflow"]')
  await expect(page).toHaveURL('/automation')
})
```

## Related Documentation

- [dnd-kit Integration](./drag-drop.md)
- [Backend Workflow Engine](../backend/workflows.md)
