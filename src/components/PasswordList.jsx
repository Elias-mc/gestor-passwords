import PasswordCard from "./PasswordCard";

function PasswordList({
  passwords,
  onFavorite,
  onCategoryChange,
  onSelectPassword,
}) {
  if (passwords.length === 0) {
    return (
      <div className="rounded-xl bg-slate-100 p-8 text-center transition-colors duration-300 dark:bg-white/5">
        <p className="text-sm text-slate-500">No se encontraron contraseñas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {passwords.map((password) => (
        <PasswordCard
          key={password.id}
          password={password}
          onFavorite={onFavorite}
          onCategoryChange={onCategoryChange}
          onClick={() => onSelectPassword(password)}
        />
      ))}
    </div>
  );
}

export default PasswordList;
