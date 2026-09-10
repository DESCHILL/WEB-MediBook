export default function workspace_layout({links,path,children}) {
    return <div className="workspace_layout"><aside className="workspace_sidebar"><nav aria-label="Chức năng">{links.map(([href,label])=><a key={href} href={href} aria-current={path===href?'page':undefined}>{label}</a>)}</nav></aside><main className="workspace_main">{children}</main></div>;
}
