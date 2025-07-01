import {
  AutoPost,
  Data,
  PostStatus,
} from '../projects/types/automation-project';

export function createData(
  id: number,
  projectName: string,
  platforms: string[],
  numberOfPosts: number,
  status: PostStatus,
  nextPostTime: Date | null,
  posts: AutoPost[],
): Data {
  return {
    id,
    title: projectName,
    platforms,
    numberOfPosts,
    status,
    nextPostAt: nextPostTime,
    posts,
  };
}

export const ProjectData = [
  createData(
    1,
    'Summer Sale Campaign',
    ['Facebook', 'Instagram'],
    5,
    'draft',
    new Date('2025-06-01T18:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-05-25T10:00:00'),
        content: 'Summer Sale teaser announcement!',
        status: 'draft',
        imageUrl: ['https://via.placeholder.com/150'],
        scheduledTime: new Date('2025-05-25T10:00:00'),
      },
      {
        id: 2,
        createdAt: new Date('2025-05-26T14:00:00'),
        content: 'Countdown to summer deals 🌞',
        status: 'draft',
        scheduledTime: new Date('2025-05-25T10:00:00'),
      },
      {
        id: 3,
        createdAt: new Date('2025-05-27T09:30:00'),
        content: 'Flash deals dropping soon!',
        status: 'draft',
      },
      {
        id: 4,
        createdAt: new Date('2025-05-29T15:00:00'),
        content: 'Sneak peek: what to expect this summer.',
        status: 'draft',
        scheduledTime: new Date('2025-06-01T18:00:00'),
      },
      {
        id: 5,
        createdAt: new Date('2025-05-30T12:00:00'),
        content: 'Last call before Summer Sale goes live!',
        status: 'draft',
      },
    ],
  ),
  createData(
    2,
    'New Product Launch Buzz',
    ['Facebook', 'Instagram'],
    7,
    'scheduled',
    new Date('2025-06-05T10:30:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-05-28T10:00:00'),
        content: 'Big reveal incoming! 🚀',
        status: 'scheduled',
        scheduledTime: new Date('2025-06-01T09:00:00'),
      },
      {
        id: 2,
        createdAt: new Date('2025-05-29T13:30:00'),
        content: 'Can you guess what we’re launching?',
        status: 'scheduled',
      },
      {
        id: 3,
        createdAt: new Date('2025-05-31T11:00:00'),
        content: '3 days until the drop!',
        status: 'scheduled',
      },
      {
        id: 4,
        createdAt: new Date('2025-06-02T10:00:00'),
        content: 'Behind-the-scenes sneak peek 🔧',
        status: 'scheduled',
      },
      {
        id: 5,
        createdAt: new Date('2025-06-03T17:00:00'),
        content: 'Meet the team behind the innovation!',
        status: 'scheduled',
      },
      {
        id: 6,
        createdAt: new Date('2025-06-04T15:00:00'),
        content: '1 day left until launch!',
        status: 'scheduled',
      },
      {
        id: 7,
        createdAt: new Date('2025-06-05T10:30:00'),
        content: '🚨 Product Launch is LIVE now!',
        status: 'scheduled',
      },
    ],
  ),
  createData(
    3,
    'Weekly Blog Promotion',
    ['Instagram'],
    2,
    'canceled',
    new Date('2025-05-29T07:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-05-27T09:00:00'),
        content: 'Check out our weekly tips on marketing strategy!',
        status: 'canceled',
      },
      {
        id: 2,
        createdAt: new Date('2025-05-29T07:00:00'),
        content: 'This week’s blog: How to increase engagement.',
        status: 'canceled',
      },
    ],
  ),
  createData(
    4,
    'Customer Testimonial Series',
    ['Facebook'],
    3,
    'scheduled',
    new Date('2025-06-03T12:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-05-28T11:00:00'),
        content: 'Real stories from real customers.',
        status: 'scheduled',
      },
      {
        id: 2,
        createdAt: new Date('2025-06-01T10:00:00'),
        content: 'Customer spotlight: Anna from LA 🎉',
        status: 'scheduled',
      },
      {
        id: 3,
        createdAt: new Date('2025-06-03T12:00:00'),
        content: 'How our product made a difference!',
        status: 'scheduled',
      },
    ],
  ),
  createData(
    5,
    'Holiday Season Promos',
    ['Facebook', 'Instagram', 'TikTok'],
    5,
    'draft',
    new Date('2025-12-01T09:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-11-25T10:00:00'),
        content: '🎁 Our biggest holiday discounts ever!',
        status: 'draft',
      },
      {
        id: 2,
        createdAt: new Date('2025-11-27T09:00:00'),
        content: 'Sneak peek at our holiday bundles ❄️',
        status: 'draft',
      },
      {
        id: 3,
        createdAt: new Date('2025-11-29T13:00:00'),
        content: 'Gifts for everyone on your list.',
        status: 'draft',
      },
      {
        id: 4,
        createdAt: new Date('2025-11-30T18:00:00'),
        content: 'Starts tomorrow: Holiday Promo season!',
        status: 'draft',
      },
      {
        id: 5,
        createdAt: new Date('2025-12-01T09:00:00'),
        content: '🚨 Holiday Sale is LIVE!',
        status: 'draft',
      },
    ],
  ),
  createData(
    6,
    'Flash Sale Reminder',
    ['Messenger'],
    3,
    'active',
    new Date('2025-06-02T20:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-06-01T20:00:00'),
        content: 'Flash Sale alert for Messenger users!',
        status: 'active',
      },
      {
        id: 2,
        createdAt: new Date('2025-06-02T08:00:00'),
        content: 'Flash Sale starts today! 🛍️',
        status: 'active',
      },
      {
        id: 3,
        createdAt: new Date('2025-06-02T20:00:00'),
        content: 'Final call before the sale ends!',
        status: 'active',
      },
    ],
  ),
  createData(
    7,
    'Behind The Scenes - Factory Tour',
    ['YouTube', 'Instagram'],
    3,
    'scheduled',
    new Date('2025-06-04T14:00:00'),
    [
      {
        id: 1,
        createdAt: new Date('2025-06-01T12:00:00'),
        content: 'Behind-the-scenes look: Day 1 setup.',
        status: 'scheduled',
        imageUrl: [
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/150',
        ],
      },
      {
        id: 2,
        createdAt: new Date('2025-06-03T14:00:00'),
        content: 'Tour part 2: Production in action!',
        status: 'scheduled',
        imageUrl: [
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/150',
        ],
      },
      {
        id: 3,
        createdAt: new Date('2025-06-04T14:00:00'),
        content: 'Final part: Meet the team behind the magic.',
        status: 'scheduled',
      },
    ],
  ),
];

export const examples = [
  {
    id: 0,
    title: 'Phong Vu Summer Tech Festival Campaign',
    content: `<h2>🔥 Phong Vũ Summer Tech Festival – Unmissable Deals!</h2>
    <p>Ready to upgrade your gear? <strong>Phong Vũ</strong> is turning up the heat this June with massive discounts on top tech!</p>
    <h3>🌟 What's Hot This Month:</h3>
    <ul>
    <li><strong>Laptops:</strong> Up to 30% OFF on ASUS, Dell, HP, and more</li>
    <li><strong>PC Components:</strong> GPUs, SSDs, RAM – all on sale</li>
    <li><strong>Gaming Gear:</strong> Save on keyboards, mice, headsets & chairs</li>
    <li><strong>Smart Devices:</strong> Tablets, smartwatches, and earbuds</li>
    <li><strong>Home Appliances:</strong> Purifiers, fans, and more</li>
    </ul>
    <h3>🎁 Extra Bonuses:</h3>
    <ul>
    <li>💳 0% installment for 12 months</li>
    <li>🎫 Online vouchers up to <strong>1,000,000 VND</strong></li>
    <li>🚛 <strong>Free delivery</strong> on selected items</li>
    </ul>
    <p><strong>🗓️ June 5 – June 30</strong></p>
    <p>Shop online or in-store: <a href="https://phongvu.vn" target="_blank">https://phongvu.vn</a></p>
    <p><em>Don't miss out – follow us on Facebook for flash sales & lucky draws!</em></p>
    `,
  },
  {
    id: 1,
    title: `🔥 Tech Deals You Can't Miss – Only at Phong Vũ!`,
    content: `
        <h2>🔥 Tech Deals You Can't Miss – Only at Phong Vũ!</h2>
        <p>
        Whether you're looking for a sleek laptop for work or a powerful PC to dominate your games, <strong>Phong Vũ</strong> has unbeatable offers for all your tech needs!
        </p>
        <ul>
        <li>💻 Up to <strong>20% OFF</strong> on laptops for work & play</li>
        <li>🖥️ Save up to <strong>3,000,000 VND</strong> on PCs and components</li>
        <li>🎧 Tech accessories from just <strong>99,000 VND</strong></li>
        </ul>
        <p>
        ✅ <strong>Free nationwide delivery</strong><br>
        ✅ <strong>0% interest installment plans</strong> – fast & easy approval!
        </p>
        <p>
        <a href="https://www.phongvu.vn" target="_blank" rel="noopener noreferrer" style="color: #3182ce; text-decoration: underline;">
            👉 Shop Now at Phong Vũ
        </a>
        </p>
        <p style="color: gray; font-size: 0.9em;">
        *Offers valid while supplies last. Don't miss out!
        </p>
    `,
  },
];
