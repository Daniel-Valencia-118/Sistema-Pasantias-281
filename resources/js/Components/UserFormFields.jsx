import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function UserFormFields({ data, setData, errors, editMode = false }) {
    return (
        <>
            <div>
                <InputLabel htmlFor="nombre_user" value="Nombre de usuario" />
                <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} required />
                <InputError message={errors.nombre_user} />
            </div>
            <div>
                <InputLabel htmlFor="correo" value="Correo electrónico" />
                <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} required />
                <InputError message={errors.correo} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="nombre" value="Nombre" />
                    <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} required />
                    <InputError message={errors.nombre} />
                </div>
                <div>
                    <InputLabel htmlFor="ap_paterno" value="Ap. Paterno" />
                    <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} required />
                    <InputError message={errors.ap_paterno} />
                </div>
                <div>
                    <InputLabel htmlFor="ap_materno" value="Ap. Materno" />
                    <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} />
                    <InputError message={errors.ap_materno} />
                </div>
                <div>
                    <InputLabel htmlFor="ci" value="CI" />
                    <TextInput id="ci" type="number" value={data.ci || ''} onChange={e => setData('ci', e.target.value)} />
                    <InputError message={errors.ci} />
                </div>
            </div>
            {!editMode && (
                <>
                    <div>
                        <InputLabel htmlFor="password" value="Contraseña" />
                        <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!editMode} />
                        <InputError message={errors.password} />
                    </div>
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                        <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={!editMode} />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </>
            )}
        </>
    );
}