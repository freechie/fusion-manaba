export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Fusion Manaba. All Rights Reserved.
        </p>
        <p className="mt-2">Made with love in Ecuador</p>
      </div>
    </footer>
  );
}
