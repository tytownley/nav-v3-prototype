"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"

/* ═══════════════════════════════════════════════════════════════
   SVG Icon Components — inlined from dbui design system
   All render at 16×16 viewBox, sized via className
   ═══════════════════════════════════════════════════════════════ */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M7.25 7.25V1h1.5v6.25H15v1.5H8.75V15h-1.5V8.75H1v-1.5z" clipRule="evenodd" />
    </svg>
  )
}

function NotebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M3 1.75A.75.75 0 0 1 3.75 1h10.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V12.5H1V11h2V8.75H1v-1.5h2V5H1V3.5h2zm1.5.75v11H6v-11zm3 0v11h6v-11z" clipRule="evenodd" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M7.25 4v4c0 .199.079.39.22.53l2 2 1.06-1.06-1.78-1.78V4z" />
      <path fill="currentColor" fillRule="evenodd" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0" clipRule="evenodd" />
    </svg>
  )
}

function CatalogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M14 .75a.75.75 0 0 0-.75-.75H4.5A2.5 2.5 0 0 0 2 2.5v10.75A2.75 2.75 0 0 0 4.75 16h8.5a.75.75 0 0 0 .75-.75zM3.5 4.792v8.458c0 .69.56 1.25 1.25 1.25h7.75V5h-8c-.356 0-.694-.074-1-.208m9-1.292v-2h-8a1 1 0 0 0 0 2z" clipRule="evenodd" />
    </svg>
  )
}

function WorkflowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M3.75 4a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m2.646-.5a2.751 2.751 0 1 1 0-1.5h5.229a3.375 3.375 0 0 1 .118 6.748L8.436 11.11a.75.75 0 0 1-.872 0l-3.3-2.357a1.875 1.875 0 0 0 .111 3.747h5.229a2.751 2.751 0 1 1 0 1.5H4.375a3.375 3.375 0 0 1-.118-6.748L7.564 4.89a.75.75 0 0 1 .872 0l3.3 2.357a1.875 1.875 0 0 0-.111-3.747zm7.104 9.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M8 6.422 5.79 8 8 9.578 10.21 8z" clipRule="evenodd" />
    </svg>
  )
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M3.394 5.586a4.752 4.752 0 0 1 9.351.946 3.75 3.75 0 0 1-.668 7.464L12 14H4a.8.8 0 0 1-.179-.021 4.25 4.25 0 0 1-.427-8.393m.72 6.914h7.762a.8.8 0 0 1 .186-.008q.092.008.188.008a2.25 2.25 0 0 0 0-4.5H12a.75.75 0 0 1-.75-.75v-.5a3.25 3.25 0 0 0-6.475-.402.75.75 0 0 1-.698.657 2.75 2.75 0 0 0-.024 5.488z" clipRule="evenodd" />
    </svg>
  )
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M10.842 4.263a.75.75 0 0 1 .863 1l-1.664 4.346a.75.75 0 0 1-.432.432l-4.346 1.664a.75.75 0 0 1-.968-.968l1.664-4.346a.75.75 0 0 1 .432-.432l4.346-1.664zM6.296 9.704l2.465-.943-1.522-1.522z" clipRule="evenodd" />
      <path fill="currentColor" fillRule="evenodd" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13" clipRule="evenodd" />
    </svg>
  )
}

function StorefrontIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M3.52 2.3a.75.75 0 0 1 .6-.3h7.76a.75.75 0 0 1 .6.3l2.37 3.158a.75.75 0 0 1 .15.45v.842q0 .059-.009.115A2.31 2.31 0 0 1 14 8.567v5.683a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V8.567A2.31 2.31 0 0 1 1 6.75v-.841a.75.75 0 0 1 .15-.45zm7.605 6.068c.368.337.847.557 1.375.6V13.5h-9V8.968a2.3 2.3 0 0 0 1.375-.6c.411.377.96.607 1.563.607.602 0 1.15-.23 1.562-.607.411.377.96.607 1.563.607.602 0 1.15-.23 1.562-.607m2.375-2.21v.532l-.001.019a.813.813 0 0 1-1.623 0l-.008-.076a1 1 0 0 0 .012-.133V4zm-3.113.445a1 1 0 0 0-.013.106.813.813 0 0 1-1.624-.019V3.5h1.63v3q0 .053.007.103M7.25 3.5v3.19l-.001.019a.813.813 0 0 1-1.623 0l-.006-.064V3.5zM4.12 4 2.5 6.16v.531l.001.019a.813.813 0 0 0 1.619.045z" clipRule="evenodd" />
    </svg>
  )
}

function QueryEditorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M12 12H8v-1.5h4zM5.53 11.53 7.56 9.5 5.53 7.47 4.47 8.53l.97.97-.97.97z" />
      <path fill="currentColor" fillRule="evenodd" d="M1.75 1a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75V1.75a.75.75 0 0 0-.75-.75zm.75 3V2.5h11V4zm0 1.5v8h11v-8z" clipRule="evenodd" />
    </svg>
  )
}

function QueryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g fill="currentColor">
        <path fillRule="evenodd" d="M2 1.75A.75.75 0 0 1 2.75 1h6a.75.75 0 0 1 .53.22l4.5 4.5c.141.14.22.331.22.53V10h-1.5V7H8.75A.75.75 0 0 1 8 6.25V2.5H3.5V16h-.75a.75.75 0 0 1-.75-.75zm7.5 1.81 1.94 1.94H9.5z" clipRule="evenodd" />
        <path d="M5.53 9.97 8.56 13l-3.03 3.03-1.06-1.06L6.44 13l-1.97-1.97zM14 14.5H9V16h5z" />
      </g>
    </svg>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M1 1.75A.75.75 0 0 1 1.75 1h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75zm1.5 8.75v3h4.75v-3zm0-1.5h4.75V2.5H2.5zm6.25-6.5v3h4.75v-3zm0 11V7h4.75v6.5z" clipRule="evenodd" />
    </svg>
  )
}

function SparkleRectangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M0 2.75A.75.75 0 0 1 .75 2H8v1.5H1.5v9h13V10H16v3.25a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75zm12.987-.14a.75.75 0 0 0-1.474 0l-.137.728a1.93 1.93 0 0 1-1.538 1.538l-.727.137a.75.75 0 0 0 0 1.474l.727.137c.78.147 1.39.758 1.538 1.538l.137.727a.75.75 0 0 0 1.474 0l.137-.727c.147-.78.758-1.39 1.538-1.538l.727-.137a.75.75 0 0 0 0-1.474l-.727-.137a1.93 1.93 0 0 1-1.538-1.538z" clipRule="evenodd" />
    </svg>
  )
}

function NotificationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M8 1a5 5 0 0 0-5 5v1.99c0 .674-.2 1.332-.573 1.892l-1.301 1.952A.75.75 0 0 0 1.75 13h3.5v.25a2.75 2.75 0 1 0 5.5 0V13h3.5a.75.75 0 0 0 .624-1.166l-1.301-1.952A3.4 3.4 0 0 1 13 7.99V6a5 5 0 0 0-5-5m1.25 12h-2.5v.25a1.25 1.25 0 1 0 2.5 0zM4.5 6a3.5 3.5 0 1 1 7 0v1.99c0 .97.287 1.918.825 2.724l.524.786H3.15l.524-.786A4.9 4.9 0 0 0 4.5 7.99z" clipRule="evenodd" />
    </svg>
  )
}

function CloudDatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M3.394 4.586a4.752 4.752 0 0 1 9.351.946A3.75 3.75 0 0 1 15.787 8H14.12a2.25 2.25 0 0 0-1.871-1H12a.75.75 0 0 1-.75-.75v-.5a3.25 3.25 0 0 0-6.475-.402.75.75 0 0 1-.698.657A2.75 2.75 0 0 0 4 11.49V13a.8.8 0 0 1-.179-.021 4.25 4.25 0 0 1-.427-8.393" />
      <path fill="currentColor" fillRule="evenodd" d="M6.25 10.5c0-.851.67-1.42 1.293-1.731C8.211 8.435 9.08 8.25 10 8.25s1.79.185 2.457.519c.622.31 1.293.88 1.293 1.731v2.277c-.014.836-.677 1.397-1.293 1.705-.668.333-1.537.518-2.457.518s-1.79-.185-2.457-.518c-.616-.308-1.279-.869-1.293-1.705V10.5m1.964 2.64c.418.209 1.049.36 1.786.36s1.368-.151 1.786-.36c.209-.105.337-.21.406-.29a.3.3 0 0 0 .057-.096l.001-.004v-.423c-.636.273-1.423.423-2.25.423s-1.614-.15-2.25-.423v.427l.005.014a.3.3 0 0 0 .053.082c.069.08.197.185.406.29M7.75 10.5v-.004l.005-.014a.3.3 0 0 1 .053-.082c.069-.08.197-.185.406-.29.418-.209 1.049-.36 1.786-.36s1.368.151 1.786.36c.209.105.337.21.406.29a.3.3 0 0 1 .057.096l.001.004v.004l-.005.014a.3.3 0 0 1-.053.082c-.069.08-.197.185-.406.29-.418.209-1.049.36-1.786.36s-1.368-.151-1.786-.36a1.3 1.3 0 0 1-.406-.29.3.3 0 0 1-.058-.096z" clipRule="evenodd" />
    </svg>
  )
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="m5.5 2 1.06 1.06-3.53 3.531L1 4.561 2.06 3.5l.97.97zM15.03 4.53h-7v-1.5h7zM1.03 14.53v-1.5h14v1.5zM8.03 9.53h7v-1.5h-7zM6.56 8.06 5.5 7 3.03 9.47l-.97-.97L1 9.56l2.03 2.031z" />
    </svg>
  )
}

function IngestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M15 2.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V6H12V3.25h1.5v9.5H12V10h-1.5v3.5c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75z" />
      <path fill="currentColor" fillRule="evenodd" d="M3.75 0c1.26 0 2.322.848 2.648 2.004A2.75 2.75 0 0 1 9 4.75v2.5h3v1.5H9v2.5a2.75 2.75 0 0 1-2.602 2.746 2.751 2.751 0 1 1-3.47-3.371 2.751 2.751 0 0 1 0-5.25A2.751 2.751 0 0 1 3.75 0M5 2.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0m-.428 2.625a2.76 2.76 0 0 0 1.822-1.867A1.25 1.25 0 0 1 7.5 4.75v2.5H6.396a2.76 2.76 0 0 0-1.824-1.875M6.396 8.75H7.5v2.5a1.25 1.25 0 0 1-1.106 1.242 2.76 2.76 0 0 0-1.822-1.867A2.76 2.76 0 0 0 6.396 8.75M3.75 12a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m0-5.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5" clipRule="evenodd" />
    </svg>
  )
}

function SparkleDoubleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M3.848 10.627 4 9.75l.152.877a1.5 1.5 0 0 0 1.221 1.22L6.25 12l-.877.152a1.5 1.5 0 0 0-1.22 1.221L4 14.25l-.152-.877a1.5 1.5 0 0 0-1.221-1.22L1.75 12l.877-.152a1.5 1.5 0 0 0 1.22-1.221" />
      <path fill="currentColor" fillRule="evenodd" d="M4 9a.75.75 0 0 1 .739.621l.152.877a.75.75 0 0 0 .61.61l.878.153a.75.75 0 0 1 0 1.478l-.877.152a.75.75 0 0 0-.61.61l-.153.878a.75.75 0 0 1-1.478 0l-.152-.877a.75.75 0 0 0-.61-.61l-.878-.153a.75.75 0 0 1 0-1.478l.877-.152a.75.75 0 0 0 .61-.61l.153-.878A.75.75 0 0 1 4 9m0 2.92-.08.08q.042.039.08.08.038-.042.08-.08zM10 0c.36 0 .67.257.737.611l.264 1.398A3.75 3.75 0 0 0 13.99 5l1.398.264a.75.75 0 0 1 0 1.474l-1.398.264A3.75 3.75 0 0 0 11 9.99l-.264 1.398a.75.75 0 0 1-1.474 0l-.264-1.398A3.75 3.75 0 0 0 6.01 7l-1.398-.264a.75.75 0 0 1 0-1.474l1.398-.264A3.75 3.75 0 0 0 9 2.01L9.263.611A.75.75 0 0 1 10 0m0 3.682A5.26 5.26 0 0 1 7.682 6 5.26 5.26 0 0 1 10 8.318 5.26 5.26 0 0 1 12.318 6 5.26 5.26 0 0 1 10 3.682" clipRule="evenodd" />
    </svg>
  )
}

function UserSparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M8 1c.664 0 1.282.2 1.797.542l-.014.072-.062.357-.357.062c-.402.07-.765.245-1.06.493a1.75 1.75 0 1 0 0 3.447c.295.25.658.424 1.06.494l.357.062.062.357.014.072A3.25 3.25 0 1 1 8 1" />
      <path fill="currentColor" d="M9.59 4.983A.75.75 0 0 1 9.62 3.51l.877-.152a.75.75 0 0 0 .61-.61l.153-.878a.75.75 0 0 1 1.478 0l.152.877a.75.75 0 0 0 .61.61l.878.153a.75.75 0 0 1 0 1.478l-.877.152a.75.75 0 0 0-.61.61l-.153.878a.75.75 0 0 1-1.478 0l-.152-.877a.75.75 0 0 0-.61-.61l-.878-.153z" />
      <path fill="currentColor" fillRule="evenodd" d="M1.164 12.287A8.74 8.74 0 0 1 8 9a8.74 8.74 0 0 1 6.836 3.287.75.75 0 0 1 .164.469v1.494a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75v-1.494a.75.75 0 0 1 .164-.469m1.336.74v.473h11v-.474A7.23 7.23 0 0 0 8 10.5c-2.2 0-4.17.978-5.5 2.526" clipRule="evenodd" />
    </svg>
  )
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M5.75 1a.75.75 0 0 0-.75.75v6.089c0 .38-.173.739-.47.976l-2.678 2.143A2.27 2.27 0 0 0 3.27 15h9.46a2.27 2.27 0 0 0 1.418-4.042L11.47 8.815A1.25 1.25 0 0 1 11 7.839V1.75a.75.75 0 0 0-.75-.75zm.75 6.839V2.5h3v5.339c0 .606.2 1.188.559 1.661H5.942A2.75 2.75 0 0 0 6.5 7.839M4.2 11 2.79 12.13a.77.77 0 0 0 .48 1.37h9.461a.77.77 0 0 0 .481-1.37L11.8 11z" clipRule="evenodd" />
    </svg>
  )
}

function LayerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M13.5 2.5H7V1h7.25a.75.75 0 0 1 .75.75V9h-1.5z" />
      <path fill="currentColor" fillRule="evenodd" d="M1 7.75A.75.75 0 0 1 1.75 7h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75zm1.5.75v5h5v-5z" clipRule="evenodd" />
      <path fill="currentColor" d="M4 5.32h6.5V12H12V4.57a.75.75 0 0 0-.75-.75H4z" />
    </svg>
  )
}

function ModelsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M0 4.75a2.75 2.75 0 0 1 5.145-1.353l4.372-.95a2.75 2.75 0 1 1 3.835 2.823l.282 2.257a2.75 2.75 0 1 1-2.517 4.46l-2.62 1.145.003.118a2.75 2.75 0 1 1-4.415-2.19L3.013 7.489A2.75 2.75 0 0 1 0 4.75M2.75 3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m2.715 1.688q.027-.164.033-.333l4.266-.928a2.75 2.75 0 0 0 2.102 1.546l.282 2.257c-.377.165-.71.412-.976.719zM4.828 6.55a2.8 2.8 0 0 1-.413.388l1.072 3.573q.13-.012.263-.012c.945 0 1.778.476 2.273 1.202l2.5-1.093a2.8 2.8 0 0 1 .012-.797zM12 10.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0M5.75 12a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5M11 2.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0" clipRule="evenodd" />
    </svg>
  )
}

function CloudModelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill="currentColor" d="M3.394 5.586a4.752 4.752 0 0 1 9.351.946A3.75 3.75 0 0 1 15.787 9H14.12a2.25 2.25 0 0 0-1.871-1H12a.75.75 0 0 1-.75-.75v-.5a3.25 3.25 0 0 0-6.475-.402.75.75 0 0 1-.698.657A2.75 2.75 0 0 0 4 12.49V14a.8.8 0 0 1-.179-.021 4.25 4.25 0 0 1-.427-8.393" />
      <path fill="currentColor" fillRule="evenodd" d="M8 7a2.25 2.25 0 0 1 2.03 3.22l.5.5a2.25 2.25 0 1 1-1.06 1.06l-.5-.5A2.25 2.25 0 1 1 8 7m.75 2.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0m3.5 3.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0" clipRule="evenodd" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Navigation Data Model
   ═══════════════════════════════════════════════════════════════ */

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus: PlusIcon, Notebook: NotebookIcon, Clock: ClockIcon,
  Catalog: CatalogIcon, Workflows: WorkflowsIcon, Cloud: CloudIcon,
  Compass: CompassIcon, Storefront: StorefrontIcon, QueryEditor: QueryEditorIcon,
  Query: QueryIcon, Dashboard: DashboardIcon, SparkleRectangle: SparkleRectangleIcon,
  Notification: NotificationIcon, CloudDatabase: CloudDatabaseIcon,
  Checklist: ChecklistIcon, Ingestion: IngestionIcon,
  SparkleDouble: SparkleDoubleIcon, UserSparkle: UserSparkleIcon,
  Beaker: BeakerIcon, Layer: LayerIcon, Models: ModelsIcon,
  CloudModel: CloudModelIcon,
}

interface NavItem {
  id: string
  label: string
  icon: string
  badge?: string
}

interface NavSection {
  id: string
  label?: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    items: [
      { id: "workspace", label: "Workspace", icon: "Notebook" },
      { id: "recents", label: "Recents", icon: "Clock" },
      { id: "catalog", label: "Catalog", icon: "Catalog" },
      { id: "jobs-pipelines", label: "Jobs & Pipelines", icon: "Workflows" },
      { id: "compute", label: "Compute", icon: "Cloud" },
      { id: "discover", label: "Discover", icon: "Compass", badge: "Beta" },
      { id: "marketplace", label: "Marketplace", icon: "Storefront" },
    ],
  },
  {
    id: "sql",
    label: "SQL",
    items: [
      { id: "sql-editor", label: "SQL Editor", icon: "QueryEditor" },
      { id: "queries", label: "Queries", icon: "Query" },
      { id: "dashboards", label: "Dashboards", icon: "Dashboard" },
      { id: "genie", label: "Genie", icon: "SparkleRectangle" },
      { id: "alerts", label: "Alerts", icon: "Notification" },
      { id: "query-history", label: "Query History", icon: "Workflows" },
      { id: "sql-warehouses", label: "SQL Warehouses", icon: "CloudDatabase" },
    ],
  },
  {
    id: "data-engineering",
    label: "Data Engineering",
    items: [
      { id: "runs", label: "Runs", icon: "Checklist" },
      { id: "data-ingestion", label: "Data Ingestion", icon: "Ingestion" },
    ],
  },
  {
    id: "ai-ml",
    label: "AI/ML",
    items: [
      { id: "playground", label: "Playground", icon: "SparkleDouble" },
      { id: "agents", label: "Agents", icon: "UserSparkle" },
      { id: "ai-gateway", label: "AI Gateway", icon: "Ingestion" },
      { id: "experiments", label: "Experiments", icon: "Beaker" },
      { id: "features", label: "Features", icon: "Layer" },
      { id: "models", label: "Models", icon: "Models" },
      { id: "serving", label: "Serving", icon: "CloudModel" },
    ],
  },
]

const ALL_ITEM_IDS = NAV_SECTIONS.flatMap(s => s.items.map(i => i.id))

interface Preset {
  name: string
  description: string
  items: string[]
  users?: { count: string; percent: number }
  itemRange?: string
}

const PRESETS: Preset[] = [
  {
    name: "Today",
    description: "All 23 navigation items visible",
    items: ALL_ITEM_IDS,
    users: { count: "870,000", percent: 100 },
  },
  {
    name: "Data Engineer",
    description: "Core + pipelines & monitoring",
    items: ["workspace", "recents", "catalog", "jobs-pipelines", "compute", "discover", "marketplace", "runs", "dashboards", "data-ingestion"],
    users: { count: "258,000", percent: 30 },
    itemRange: "5–7",
  },
  {
    name: "Browse & Explore",
    description: "File browser & catalog explorer",
    items: ["workspace", "recents", "catalog", "jobs-pipelines", "compute", "discover", "marketplace"],
    users: { count: "252,000", percent: 29 },
    itemRange: "2–3",
  },
  {
    name: "SQL Analyst",
    description: "Core + essential SQL items only",
    items: ["workspace", "recents", "catalog", "jobs-pipelines", "compute", "discover", "marketplace", "queries", "dashboards", "sql-warehouses", "query-history"],
    users: { count: "252,000", percent: 24 },
    itemRange: "4–6",
  },
  {
    name: "BI Consumer",
    description: "Dashboards & Genie spaces only",
    items: ["workspace", "recents", "catalog", "jobs-pipelines", "compute", "discover", "marketplace", "dashboards", "genie"],
    users: { count: "104,000", percent: 12 },
    itemRange: "4–6",
  },
  {
    name: "ML Engineer",
    description: "AI playground, models & serving",
    items: ["workspace", "recents", "catalog", "jobs-pipelines", "compute", "discover", "marketplace", "playground", "models", "experiments", "serving"],
    users: { count: "43,000", percent: 5 },
    itemRange: "6–9",
  },
]

/* ═══════════════════════════════════════════════════════════════
   Animated Nav Item
   ═══════════════════════════════════════════════════════════════ */

function AnimatedNavItem({ item, visible }: { item: NavItem; visible: boolean }) {
  const Icon = ICON_MAP[item.icon]
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(visible)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setMounted(false), 250)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!mounted) return null

  return (
    <div
      ref={ref}
      style={{
        maxHeight: animating ? 28 : 0,
        opacity: animating ? 1 : 0,
        transform: animating ? "translateY(0)" : "translateY(-4px)",
        transition: "max-height 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease, transform 200ms ease",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center h-[28px] px-4 rounded-[6px] gap-2 cursor-pointer transition-colors hover:bg-black/[0.04]"
      >
        {Icon && <Icon className="size-[14px] shrink-0 text-[#5f7281]" />}
        <span className="text-[13px] leading-[20px] text-[#11171c] whitespace-nowrap" style={{ fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400 }}>
          {item.label}
        </span>
        {item.badge && (
          <span
            className="inline-flex items-center rounded-[4px] px-[6px] h-[18px] text-[11px] leading-[14px] font-medium"
            style={{ background: "rgba(0, 0, 59, 0.05)", color: "#2f265f", fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            {item.badge}
          </span>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Animated Section
   ═══════════════════════════════════════════════════════════════ */

function AnimatedSection({ section, visibleItems }: { section: NavSection; visibleItems: Set<string> }) {
  const anyVisible = section.items.some(i => visibleItems.has(i.id))
  const [mounted, setMounted] = useState(anyVisible)
  const [animating, setAnimating] = useState(anyVisible)

  useEffect(() => {
    if (anyVisible) {
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [anyVisible])

  if (!mounted) return null

  return (
    <div
      style={{
        opacity: animating ? 1 : 0,
        transform: animating ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 250ms ease, transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="flex flex-col py-px">
        {section.label && (
          <div className="flex items-center h-[28px] px-4 gap-2">
            <span
              className="text-[12px] leading-[16px] text-[#5f7281] whitespace-nowrap"
              style={{ fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400 }}
            >
              {section.label}
            </span>
          </div>
        )}
        {section.items.map(item => (
          <AnimatedNavItem key={item.id} item={item} visible={visibleItems.has(item.id)} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Left Nav Component (Pixel-Perfect Figma Match)
   ═══════════════════════════════════════════════════════════════ */

function LeftNav({ visibleItems }: { visibleItems: Set<string> }) {
  return (
    <div
      className="flex flex-col gap-4 p-2 rounded-[12px] border border-[#ebebeb] h-full overflow-y-auto"
      style={{
        background: "#f7f7f7",
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* New button */}
      <button
        className="flex items-center gap-2 h-[37px] px-4 py-[6px] rounded-[6px] border shrink-0 transition-colors hover:border-[rgba(255,73,73,0.28)]"
        style={{
          background: "rgba(255, 73, 73, 0.04)",
          borderColor: "rgba(255, 73, 73, 0.16)",
        }}
      >
        <PlusIcon className="size-4 shrink-0 text-[#ff4949]" />
        <span className="text-[13px] leading-[20px] text-[#1f272d]" style={{ fontWeight: 600 }}>
          New
        </span>
      </button>

      {/* Sections */}
      {NAV_SECTIONS.map(section => (
        <AnimatedSection key={section.id} section={section} visibleItems={visibleItems} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Control Panel
   ═══════════════════════════════════════════════════════════════ */

function ControlPanel({
  visibleItems,
  onToggleItem,
  onToggleSection,
  onApplyPreset,
  activePreset,
  itemCount,
}: {
  visibleItems: Set<string>
  onToggleItem: (id: string) => void
  onToggleSection: (sectionId: string) => void
  onApplyPreset: (items: string[]) => void
  activePreset: string | null
  itemCount: number
}) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-[380px] w-full">
      {/* Item counter */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-[#f0f4f8] border border-[#e1e8ef]">
        <div className="flex items-center justify-center size-10 rounded-full bg-white border border-[#e1e8ef] shadow-sm">
          <span className="text-[16px] font-bold text-[#11171c]">{itemCount}</span>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#11171c]">Items visible</p>
          <p className="text-[11px] text-[#5f7281]">of {ALL_ITEM_IDS.length} total</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <div className="w-[80px] h-[6px] rounded-full bg-[#dde5ed] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(itemCount / ALL_ITEM_IDS.length) * 100}%`,
                background: itemCount <= 7 ? "#22c55e" : itemCount <= 14 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-[11px] font-semibold text-[#8696a6] uppercase tracking-wider mb-2">Presets</p>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map(preset => {
            const isActive = activePreset === preset.name
            return (
              <button
                key={preset.name}
                onClick={() => onApplyPreset(preset.items)}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-[8px] text-left transition-all duration-150 ${
                  isActive
                    ? "bg-[#11171c] text-white shadow-sm"
                    : "hover:bg-[#f0f4f8] text-[#11171c]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-[13px] font-medium ${isActive ? "text-white" : "text-[#11171c]"}`}>
                      {preset.name}
                    </p>
                    {preset.users && (
                      <span className={`text-[12px] font-medium tabular-nums ${isActive ? "text-white/70" : "text-[#5f7281]"}`}>
                        {preset.users.percent === 100 ? "100% of users" : `${preset.users.percent}%`}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isActive ? "text-white/50" : "text-[#8696a6]"}`}>
                    {preset.itemRange ? `${preset.itemRange} navigation items` : `${preset.items.length} navigation items`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */

export default function LeftNavPage() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set(ALL_ITEM_IDS))
  const [activePreset, setActivePreset] = useState<string | null>("Today")

  const toggleItem = useCallback((id: string) => {
    setVisibleItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setActivePreset(null)
  }, [])

  const toggleSection = useCallback((sectionId: string) => {
    const section = NAV_SECTIONS.find(s => s.id === sectionId)
    if (!section) return
    setVisibleItems(prev => {
      const next = new Set(prev)
      const allVisible = section.items.every(i => next.has(i.id))
      section.items.forEach(i => allVisible ? next.delete(i.id) : next.add(i.id))
      return next
    })
    setActivePreset(null)
  }, [])

  const applyPreset = useCallback((items: string[]) => {
    setVisibleItems(new Set(items))
    const preset = PRESETS.find(p => p.items.length === items.length && p.items.every(i => items.includes(i)))
    setActivePreset(preset?.name ?? null)
  }, [])

  const itemCount = visibleItems.size

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#ffffff",
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Nav sidebar */}
      <div className="shrink-0 p-3 h-full" style={{ width: 208 }}>
        <LeftNav visibleItems={visibleItems} />
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto">
        <ControlPanel
          visibleItems={visibleItems}
          onToggleItem={toggleItem}
          onToggleSection={toggleSection}
          onApplyPreset={applyPreset}
          activePreset={activePreset}
          itemCount={itemCount}
        />
      </div>
    </div>
  )
}
