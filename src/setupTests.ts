import "@testing-library/jest-dom";

// Create a mock DOM environment
const mockDOM = () => {
  const div = document.createElement("div");
  div.id = "root";
  document.body.appendChild(div);
};

// Initialize the mock DOM before each test
beforeEach(() => {
  document.body.innerHTML = "";
  mockDOM();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
