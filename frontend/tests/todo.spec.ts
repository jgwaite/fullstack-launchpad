import { test, expect, type Page } from '@playwright/test'

async function waitForMutation(page: Page) {
  await page.waitForTimeout(120)
}

test.describe('Todo dashboard', () => {
  test('creates a list, manages items, filters, and cleans up', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Todo Command Center' })).toBeVisible()
    await expect(page.getByText('Launchpad Template')).toBeVisible()

    // Create a todo list
    await page.getByRole('button', { name: 'New list' }).click()
    const listDialog = page.getByRole('dialog', { name: 'Create a todo list' })
    await listDialog.getByLabel('Name').fill('Launch Checklist')
    await listDialog.getByLabel('Description (optional)').fill('Tasks before shipping the template')

    const createListResponse = page.waitForResponse((response) =>
      response.url().includes('/api/todo/lists') && response.request().method() === 'POST',
    )
    await listDialog.getByRole('button', { name: 'Create list' }).click()
    const createdList = await createListResponse.then((res) => res.json())
    const listId: string = createdList.id

    const listButton = page.getByTestId(`todo-list-${listId}`)
    await expect(listButton).toBeVisible()
    await expect(listButton).toContainText('0 tasks')

    // Add an item to the list
    const addTaskButton = page.getByRole('button', { name: 'Add task' })
    await expect(addTaskButton).toBeVisible()
    await addTaskButton.click()
    const itemDialog = page.getByRole('dialog', { name: 'Create a task' })
    await itemDialog.getByLabel('Title').fill('Write README')
    await itemDialog.getByLabel('Notes').fill('Highlight architecture decisions')
    await itemDialog.getByLabel('Tags').fill('docs, writing')
    const createItemResponse = page.waitForResponse((response) =>
      response.url().includes('/api/todo/lists') &&
      response.url().endsWith(`/items`) &&
      response.request().method() === 'POST',
    )
    await itemDialog.getByRole('button', { name: 'Add task' }).click()
    await createItemResponse
    await waitForMutation(page)
    await page.waitForResponse((response) =>
      response.url().includes(`/api/todo/lists/${listId}?include_items=true`) && response.request().method() === 'GET',
    )

    const itemCard = page.locator('[data-testid="todo-item-card"]').filter({ hasText: 'Write README' })
    await expect(itemCard).toBeVisible()
    await expect(itemCard).toContainText('docs')
    await expect(itemCard).toContainText('writing')

    // Mark the item as Done via the status combobox
    await itemCard.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Done' }).click()
    await waitForMutation(page)
    await expect(itemCard).toContainText('Done')

    // Filter by done and confirm the card is still visible
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(itemCard).toBeVisible()

    // Delete the item via the overflow menu
    await itemCard.getByRole('button', { name: 'Item actions' }).click()
    const deleteResponse = page.waitForResponse((response) =>
      response.url().includes('/api/todo/items') && response.request().method() === 'DELETE',
    )
    await page.getByRole('menuitem', { name: 'Delete item' }).click()
    await deleteResponse
    await waitForMutation(page)
    await expect(page.getByText('No tasks match the current filters.')).toBeVisible()

    // Reset filters and confirm the empty state persists
    await page.getByRole('button', { name: 'All' }).click()
    await expect(page.getByText('No tasks match the current filters.')).toBeVisible()

    // Delete the list from the sidebar
    const deleteListResponse = page.waitForResponse((response) =>
      response.url().includes(`/api/todo/lists/${listId}`) && response.request().method() === 'DELETE',
    )
    await page.getByTestId(`delete-todo-list-${listId}`).click()
    await deleteListResponse
    await waitForMutation(page)

    await expect(page.getByText('Create your first list')).toBeVisible()
  })
})
