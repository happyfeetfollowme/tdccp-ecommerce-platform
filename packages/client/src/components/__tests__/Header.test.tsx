import { render, screen } from '@testing-library/react';
import Header from '../Header'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock next/link if necessary, though for basic rendering it might not be strictly needed
// If interactions or specific link behaviors are tested, mocking becomes important.
// jest.mock('next/link', () => {
//   return ({ children, href }: { children: React.ReactNode; href: string }) => {
//     return <a href={href}>{children}</a>;
//   };
// });

// Mock next/image for components that use it if actual image rendering isn't needed for the test
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));


describe('Header Component', () => {
  it('renders the site title "Crafty"', () => {
    render(<Header />);
    // Check for the site title. The text "Crafty" is inside an <h2> within a Link.
    // We can look for the text directly.
    const titleElement = screen.getByText('Crafty');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H2');
  });

  it('renders the Crafty logo', () => {
    render(<Header />);
    // The logo is an SVG. We can check if its parent link is present.
    // Or give the SVG a test-id or role if more specific targeting is needed.
    // For now, checking if the link containing the logo is there and points to home.
    const logoLink = screen.getByRole('link', { name: /Crafty/i }); // Name includes the h2 text
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders a link to the cart page', () => {
    render(<Header />);
    // The cart link contains a ShoppingCartIcon.
    // We can find the link by its href or by a more specific accessible name if added.
    // For now, let's assume the link can be found by its href or a role + name if the icon provides one.
    // The icon itself doesn't have text, so we target the link.
    // A more robust way would be to add aria-label="Shopping cart" to the Link.
    const cartLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/cart');
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('renders a link to the user profile page', () => {
    render(<Header />);
    // The user profile link is an <a> tag with a background image.
    // Similar to cart, finding by href.
    // Adding an aria-label="User profile" would be good.
    const userProfileLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/user');
    expect(userProfileLink).toBeInTheDocument();
    expect(userProfileLink).toHaveAttribute('href', '/user');
  });
});
