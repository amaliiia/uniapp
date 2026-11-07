export default function Placeholder({ titulo }: { titulo: string }) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-extrabold">{titulo}</h1>
            <p className="mt-2 text-slate-500">Em construção.</p>
        </div>
    )
}