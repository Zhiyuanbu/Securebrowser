import { Shield } from "lucide-react";

export default function TitleBar() {
  return (
    <div className="browser-title-bar">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-semibold" style={{ color: 'var(--browser-dark)' }}>
            SecureBrowser
          </span>
        </div>
        <div className="text-xs" style={{ color: 'var(--browser-light)' }}>
          v2.1.0
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className="w-3 h-3 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--browser-yellow)' }}
          title="Minimize"
        />
        <button 
          className="w-3 h-3 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--browser-green)' }}
          title="Maximize"
        />
        <button 
          className="w-3 h-3 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--browser-red)' }}
          title="Close"
        />
      </div>
    </div>
  );
}
