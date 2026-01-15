// Load environment variables for testing
require('dotenv').config({ path: '.env.local' })

// DOM matchers
require('@testing-library/jest-dom')

// fetch() polyfill for Jest/jsdom (Node doesn't provide it consistently)
// node-fetch v2 is already a dependency in this repo.
if (!global.fetch) {
	const fetch = require('node-fetch')
	global.fetch = fetch
	global.Headers = fetch.Headers
	global.Request = fetch.Request
	global.Response = fetch.Response
}

// DOM polyfills often needed by Radix UI and friends
if (!window.matchMedia) {
	window.matchMedia = () => ({
		matches: false,
		media: '',
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})
}

if (!global.ResizeObserver) {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}

// Next.js mocks
jest.mock('next/image', () => {
	// eslint-disable-next-line react/display-name
	return function MockedNextImage(props) {
		const { src = '', alt = '', ...rest } = props
		// Render as a normal img for tests
		return require('react').createElement('img', { src, alt, ...rest })
	}
})

jest.mock('next/link', () => {
	const React = require('react')
	return {
		__esModule: true,
		default: ({ href, children, ...rest }) =>
			React.createElement('a', { href: typeof href === 'string' ? href : href?.pathname, ...rest }, children),
	}
})

// Default pathname; individual tests can override via jest.spyOn.
jest.mock('next/navigation', () => ({
	__esModule: true,
	usePathname: () => '/',
	useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
	useSearchParams: () => ({ get: () => null }),
}))

// next/dynamic mock: render loading component (safe default for unit tests)
jest.mock('next/dynamic', () => {
	const React = require('react')
	return (importer, options) => {
		const Loading = options?.loading
		// eslint-disable-next-line react/display-name
		return function DynamicMock(props) {
			return Loading ? React.createElement(Loading, props) : null
		}
	}
})

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
		message: jest.fn(),
	},
}))

// Framer-motion mock: render motion components as plain elements
jest.mock('framer-motion', () => {
	const React = require('react')

	const MOTION_PROPS = new Set([
		// animation props
		'animate',
		'initial',
		'exit',
		'variants',
		'transition',
		'custom',
		'layout',
		'layoutId',
		'layoutScroll',
		'layoutRoot',
		// gesture props
		'whileHover',
		'whileTap',
		'whileDrag',
		'whileFocus',
		'whileInView',
		'drag',
		'dragControls',
		'dragConstraints',
		'dragElastic',
		'dragMomentum',
		'dragPropagation',
		'onDrag',
		'onDragStart',
		'onDragEnd',
		'onDirectionLock',
		'onDragTransitionEnd',
		'onHoverStart',
		'onHoverEnd',
		'onPan',
		'onPanStart',
		'onPanEnd',
		'onTap',
		'onTapStart',
		'onTapCancel',
		'onViewportEnter',
		'onViewportLeave',
		'viewport',
		// misc
		'style',
	])

	const stripMotionProps = (props) => {
		if (!props) return props
		const cleaned = { ...props }
		for (const key of Object.keys(cleaned)) {
			if (MOTION_PROPS.has(key)) delete cleaned[key]
		}
		return cleaned
	}

	const passthrough = (Tag) =>
		// eslint-disable-next-line react/display-name
		React.forwardRef(({ children, ...props }, ref) =>
			React.createElement(Tag, { ref, ...stripMotionProps(props) }, children)
		)

	return {
		__esModule: true,
		AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
		motion: new Proxy(
			{},
			{
				get: (_target, prop) => {
					// Support motion.div, motion.button, etc.
					return passthrough(prop)
				},
			}
		),
	}
})
