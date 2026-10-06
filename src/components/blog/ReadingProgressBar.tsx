/**
 * Reading progress indicator driven entirely by a CSS scroll-driven animation
 * (see `.reading-progress` in globals.css). No JavaScript; hidden where unsupported.
 */
export function ReadingProgressBar() {
    return <div className="reading-progress" aria-hidden="true" />;
}
