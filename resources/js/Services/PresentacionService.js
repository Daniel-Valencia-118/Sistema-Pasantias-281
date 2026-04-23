import axios from 'axios';

class PresentacionService {
    /**
     * Obtener la configuración de presentación
     */
    static async getPresentacion() {
        try {
            const response = await axios.get('/api/presentacion');
            return response.data;
        } catch (error) {
            console.error('Error al obtener presentación:', error);
            // Retornar valores por defecto en caso de error
            return {
                mision: 'Facilitar la conexión entre estudiantes, empresas y la universidad, optimizando el proceso de pasantías para formar profesionales competentes y comprometidos con la excelencia.',
                vision: 'Ser el sistema líder en gestión de pasantías universitarias, reconocido por su innovación y eficiencia en la vinculación academia-empresa.',
                url_logo: null,
                nombre_sistema: 'Sistema de Gestión de Pasantías',
                descripcion_corta: 'Conectando talento con oportunidades',
            };
        }
    }

    /**
     * Actualizar la configuración de presentación (admin)
     */
    static async updatePresentacion(formData) {
        try {
            const response = await axios.post('/api/admin/presentacion', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar presentación:', error);
            throw error;
        }
    }
}

export default PresentacionService;