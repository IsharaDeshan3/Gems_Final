// Example usage of the Repository Layer
// This file demonstrates how to use the repositories in your application

import { getRepositoryFactory } from './index'
import { getSupabaseClient } from '../supabase'

function getRepositories() {
  return getRepositoryFactory(getSupabaseClient())
}

// Example: User Management
async function exampleUserOperations() {
  const userRepo = getRepositories().getUserRepository()

  // Create a new user
  const newUser = await userRepo.create({
    email: 'john@example.com',
    password_hash: 'hashed_password',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user'
  })

  // Find user by email
  const user = await userRepo.findByEmail('john@example.com')

  // Update user profile
  if (user) {
    await userRepo.updateProfile(user.id, {
      first_name: 'Johnny',
      last_name: 'Doe Jr.'
    })
  }

  // Search users
  const searchResults = await userRepo.searchUsers('john', 10)
}

// Example: Gem Management
async function exampleGemOperations() {
  const gemRepo = getRepositories().getGemRepository()

  // Create a new gem
  const newGem = await gemRepo.create({
    name: 'Ceylon Sapphire',
    identification: 'Natural sapphire',
    price: 2500.0,
    weight_carats: '1.50',
    color: 'Blue',
    clarity: 'VS1',
    shape_and_cut: 'Oval / Mixed cut',
    dimensions: '7.2 x 5.8 x 3.6 mm',
    treatments: 'None',
    origin: 'Sri Lanka',
    images: [],
    stock_quantity: 5,
    is_active: true
  })

  // Search gems
  const searchResults = await gemRepo.searchGems('diamond', 20)

  // Advanced filtering
  const filteredGems = await gemRepo.findGemsWithFilters({
    minPrice: 1000,
    maxPrice: 5000,
    color: 'D'
  }, 20)
}

// Example: Order Management
async function exampleOrderOperations() {
  const repositories = getRepositories()
  const orderRepo = repositories.getOrderRepository()
  const userRepo = repositories.getUserRepository()
  const gemRepo = repositories.getGemRepository()

  // Get a user and some gems
  const user = await userRepo.findByEmail('john@example.com')
  const gems = await gemRepo.findActiveGems(5)

  if (user && gems.length > 0) {
    const gem = gems[0]

    // Create an order with items
    const orderWithItems = await orderRepo.createOrderWithItems(
      {
        user_id: user.id,
        shipping_address: { street: '123 Main St', city: 'NYC' },
        billing_address: { street: '123 Main St', city: 'NYC' },
        payment_method: 'credit_card'
      },
      [
        {
          gem_id: gem.id,
          quantity: 1,
          unit_price: gem.price,
          total_price: gem.price
        }
      ]
    )

    // Update order status
    await orderRepo.updateStatus(orderWithItems.id, 'confirmed')

    // Get user's order history
    const orderHistory = await orderRepo.getUserOrderHistory(user.id)
  }
}

// Example: Audit Logging
async function exampleAuditLogging() {
  const repositories = getRepositories()
  const auditRepo = repositories.getAuditLogRepository()
  const userRepo = repositories.getUserRepository()

  const user = await userRepo.findByEmail('admin@example.com')

  if (user) {
    // Log an admin action
    await auditRepo.logAdminAction(
      user.id,
      'USER_UPDATED',
      {
        type: 'user',
        id: user.id
      },
      {
        oldValues: { role: 'user' },
        newValues: { role: 'admin' }
      }
    )

    // Get recent activity
    const recentLogs = await auditRepo.getRecentActivity(10)

    // Search audit logs
    const searchResults = await auditRepo.searchLogs('user', 20)
  }
}

// Example: Repository Statistics
async function exampleStatistics() {
  const repositories = getRepositories()
  const orderRepo = repositories.getOrderRepository()
  const gemRepo = repositories.getGemRepository()

  // Get order statistics
  const orderStats = await orderRepo.getOrderStatistics()
  console.log('Order Statistics:', orderStats)

  // Get gem price range
  const priceRange = await gemRepo.getPriceRange()
  console.log('Gem Price Range:', priceRange)

    // Categories were removed from gems; use other filters instead.
}

export {
  exampleUserOperations,
  exampleGemOperations,
  exampleOrderOperations,
  exampleAuditLogging,
  exampleStatistics
}