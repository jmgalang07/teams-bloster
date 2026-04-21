import { useEffect, useMemo, useState } from 'react';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import EmptyState from '../components/EmptyState';
import { useSiteData } from '../context/SiteDataContext';
import { optimizeImageForStorage } from '../utils/imageUtils';
import {
  FISH_TYPE_OPTIONS,
  assetPath,
  buildLookup,
  formatDate,
  formatFishType,
  formatWeight,
  sortCatches,
} from '../utils/siteUtils';

const waterTypeOptions = ['Embalse', 'Charca', 'Rio', 'Canal', 'Lago', 'Pais / zona'];
const waterDifficultyOptions = ['Baja', 'Baja / media', 'Media', 'Media / alta', 'Alta'];
const today = new Date().toISOString().slice(0, 10);

const buildInitialCaptureForm = ({ members, waters, baits, rigOptions }) => ({
  memberId: members[0]?.id ?? '',
  waterId: waters[0]?.id ?? '',
  baitId: baits[0]?.id ?? '',
  carpType: 'royal',
  weightKg: '',
  rig: rigOptions[0] ?? '',
  customRig: '',
  date: today,
  notes: '',
});

const buildInitialWaterForm = () => ({
  name: '',
  shortName: '',
  type: 'Embalse',
  province: 'Badajoz',
  description: '',
  knownFor: '',
  bestSeason: 'Primavera y otono',
  difficulty: 'Media',
  tags: '',
  website: '',
  notes: '',
});

export default function UploadPanelPage() {
  const {
    members,
    waters,
    baits,
    catches,
    customCounts,
    rigOptions,
    addCapture,
    updateCapture,
    deleteCapture,
    addWater,
    updateWater,
    deleteWater,
    exportPayload,
    projectSyncPayload,
    projectSyncStatus,
    projectSyncFilePath,
    resetCustomData,
    importCustomData,
  } = useSiteData();

  const membersById = useMemo(() => buildLookup(members), [members]);
  const watersById = useMemo(() => buildLookup(waters), [waters]);
  const initialCaptureForm = useMemo(
    () => buildInitialCaptureForm({ members, waters, baits, rigOptions }),
    [baits, members, rigOptions, waters],
  );

  const [captureForm, setCaptureForm] = useState(initialCaptureForm);
  const [waterForm, setWaterForm] = useState(buildInitialWaterForm);
  const [captureImage, setCaptureImage] = useState('');
  const [waterImage, setWaterImage] = useState('');
  const [captureImageName, setCaptureImageName] = useState('');
  const [waterImageName, setWaterImageName] = useState('');
  const [captureStatus, setCaptureStatus] = useState(null);
  const [waterStatus, setWaterStatus] = useState(null);
  const [managementStatus, setManagementStatus] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isProcessingCaptureImage, setIsProcessingCaptureImage] = useState(false);
  const [isProcessingWaterImage, setIsProcessingWaterImage] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [editingCaptureId, setEditingCaptureId] = useState(null);
  const [editingWaterId, setEditingWaterId] = useState(null);
  const [captureFileInputKey, setCaptureFileInputKey] = useState(0);
  const [waterFileInputKey, setWaterFileInputKey] = useState(0);

  useEffect(() => {
    setCaptureForm((current) => ({
      ...current,
      memberId: members.some((member) => member.id === current.memberId)
        ? current.memberId
        : (members[0]?.id ?? ''),
      waterId: waters.some((water) => water.id === current.waterId)
        ? current.waterId
        : (waters[0]?.id ?? ''),
      baitId: baits.some((bait) => bait.id === current.baitId)
        ? current.baitId
        : (baits[0]?.id ?? ''),
      rig:
        current.rig === '__custom__' || rigOptions.includes(current.rig)
          ? current.rig
          : (rigOptions[0] ?? ''),
    }));
  }, [baits, members, rigOptions, waters]);

  const sortedCatches = useMemo(() => sortCatches(catches, 'date-desc'), [catches]);
  const sortedWaters = useMemo(
    () => [...waters].sort((left, right) => left.shortName.localeCompare(right.shortName)),
    [waters],
  );
  const catchCountByWaterId = useMemo(
    () =>
      catches.reduce((accumulator, capture) => {
        accumulator[capture.waterId] = (accumulator[capture.waterId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [catches],
  );
  const provinceSuggestions = useMemo(
    () => [...new Set(['Badajoz', 'Caceres', 'Portugal', ...waters.map((water) => water.province)])],
    [waters],
  );

  const clearCaptureEditor = () => {
    setEditingCaptureId(null);
    setCaptureForm(buildInitialCaptureForm({ members, waters, baits, rigOptions }));
    setCaptureImage('');
    setCaptureImageName('');
    setCaptureFileInputKey((current) => current + 1);
  };

  const clearWaterEditor = () => {
    setEditingWaterId(null);
    setWaterForm(buildInitialWaterForm());
    setWaterImage('');
    setWaterImageName('');
    setWaterFileInputKey((current) => current + 1);
  };

  const handleCaptureFieldChange = (event) => {
    const { name, value } = event.target;
    setCaptureStatus(null);
    setManagementStatus(null);
    setCaptureForm((current) => ({ ...current, [name]: value }));
  };

  const handleWaterFieldChange = (event) => {
    const { name, value } = event.target;
    setWaterStatus(null);
    setManagementStatus(null);
    setWaterForm((current) => ({ ...current, [name]: value }));
  };

  const handleCaptureImageChange = async (event) => {
    const file = event.target.files?.[0];
    setCaptureStatus(null);

    if (!file) {
      if (!editingCaptureId) {
        setCaptureImage('');
        setCaptureImageName('');
      }
      return;
    }

    setIsProcessingCaptureImage(true);

    try {
      const optimizedImage = await optimizeImageForStorage(file);
      setCaptureImage(optimizedImage);
      setCaptureImageName(file.name);
    } catch (error) {
      setCaptureStatus({
        tone: 'error',
        text: error.message || 'No hemos podido preparar la foto.',
      });
    } finally {
      setIsProcessingCaptureImage(false);
    }
  };

  const handleWaterImageChange = async (event) => {
    const file = event.target.files?.[0];
    setWaterStatus(null);

    if (!file) {
      if (!editingWaterId) {
        setWaterImage('');
        setWaterImageName('');
      }
      return;
    }

    setIsProcessingWaterImage(true);

    try {
      const optimizedImage = await optimizeImageForStorage(file, { maxDimension: 1600 });
      setWaterImage(optimizedImage);
      setWaterImageName(file.name);
    } catch (error) {
      setWaterStatus({
        tone: 'error',
        text: error.message || 'No hemos podido preparar la imagen del escenario.',
      });
    } finally {
      setIsProcessingWaterImage(false);
    }
  };

  const handleCaptureSubmit = (event) => {
    event.preventDefault();
    setCaptureStatus(null);
    setManagementStatus(null);

    const finalRig =
      captureForm.rig === '__custom__' ? captureForm.customRig.trim() : captureForm.rig.trim();
    const imageToPersist = captureImage || (editingCaptureId ? catches.find((item) => item.id === editingCaptureId)?.image : '');

    if (!imageToPersist) {
      setCaptureStatus({ tone: 'error', text: 'Necesitas subir o conservar una foto.' });
      return;
    }

    if (!captureForm.memberId || !captureForm.waterId || !captureForm.baitId) {
      setCaptureStatus({
        tone: 'error',
        text: 'Completa pescador, escenario y cebo antes de guardar.',
      });
      return;
    }

    if (!finalRig) {
      setCaptureStatus({
        tone: 'error',
        text: 'Selecciona un montaje o escribe uno personalizado.',
      });
      return;
    }

    if (!captureForm.weightKg || Number(captureForm.weightKg) <= 0) {
      setCaptureStatus({
        tone: 'error',
        text: 'Introduce un peso valido en kg.',
      });
      return;
    }

    try {
      const payload = {
        memberId: captureForm.memberId,
        waterId: captureForm.waterId,
        baitId: captureForm.baitId,
        carpType: captureForm.carpType,
        weightKg: Number(captureForm.weightKg),
        rig: finalRig,
        date: captureForm.date,
        notes: captureForm.notes,
        image: imageToPersist,
      };

      const savedCapture = editingCaptureId
        ? updateCapture(editingCaptureId, payload)
        : addCapture(payload);

      setCaptureStatus({
        tone: 'success',
        text: editingCaptureId
          ? `Captura actualizada correctamente para ${membersById[savedCapture.memberId]?.name || 'el pescador seleccionado'}.`
          : `${membersById[savedCapture.memberId]?.name || 'Captura'} guardada correctamente en ${watersById[savedCapture.waterId]?.shortName || 'el escenario seleccionado'}.`,
      });
      clearCaptureEditor();
    } catch (error) {
      setCaptureStatus({
        tone: 'error',
        text: error.message || 'No se ha podido guardar la captura.',
      });
    }
  };

  const handleWaterSubmit = (event) => {
    event.preventDefault();
    setWaterStatus(null);
    setManagementStatus(null);

    if (!waterForm.name.trim()) {
      setWaterStatus({
        tone: 'error',
        text: 'El escenario necesita al menos un nombre.',
      });
      return;
    }

    try {
      const payload = {
        ...waterForm,
        shortName: waterForm.shortName.trim() || waterForm.name.trim(),
        image: waterImage || (editingWaterId ? waters.find((item) => item.id === editingWaterId)?.image : 'images/logo.png'),
      };

      const savedWater = editingWaterId ? updateWater(editingWaterId, payload) : addWater(payload);

      setWaterStatus({
        tone: 'success',
        text: editingWaterId
          ? `${savedWater.shortName} se ha actualizado correctamente.`
          : `${savedWater.shortName} ya aparece en los filtros y tambien en el formulario de capturas.`,
      });
      clearWaterEditor();
      setCaptureForm((current) => ({ ...current, waterId: savedWater.id }));
    } catch (error) {
      setWaterStatus({
        tone: 'error',
        text: error.message || 'No se ha podido guardar el escenario.',
      });
    }
  };

  const startEditingCapture = (capture) => {
    const existingRig = rigOptions.includes(capture.rig) ? capture.rig : '__custom__';

    setEditingCaptureId(capture.id);
    setCaptureForm({
      memberId: capture.memberId,
      waterId: capture.waterId,
      baitId: capture.baitId,
      carpType: capture.carpType,
      weightKg: String(capture.weightKg),
      rig: existingRig,
      customRig: existingRig === '__custom__' ? capture.rig : '',
      date: capture.date,
      notes: capture.notes ?? '',
    });
    setCaptureImage(capture.image || '');
    setCaptureImageName(capture.image ? 'Imagen actual' : '');
    setCaptureStatus(null);
    setManagementStatus({ tone: 'success', text: 'Captura cargada en el formulario para editarla.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingWater = (water) => {
    setEditingWaterId(water.id);
    setWaterForm({
      name: water.name,
      shortName: water.shortName,
      type: water.type,
      province: water.province,
      description: water.description,
      knownFor: water.knownFor,
      bestSeason: water.bestSeason,
      difficulty: water.difficulty,
      tags: Array.isArray(water.tags) ? water.tags.join(', ') : '',
      website: water.website || '',
      notes: water.notes || '',
    });
    setWaterImage(water.image || '');
    setWaterImageName(water.image ? 'Imagen actual' : '');
    setWaterStatus(null);
    setManagementStatus({ tone: 'success', text: 'Escenario cargado en el formulario para editarlo.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCapture = (capture) => {
    const memberName = membersById[capture.memberId]?.name || 'este pescador';
    const waterName = watersById[capture.waterId]?.shortName || 'este escenario';
    const confirmed = window.confirm(
      `Vas a borrar la captura de ${memberName} en ${waterName}. ¿Quieres continuar?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteCapture(capture.id);

      if (editingCaptureId === capture.id) {
        clearCaptureEditor();
      }

      setManagementStatus({
        tone: 'success',
        text: 'La captura se ha borrado correctamente.',
      });
    } catch (error) {
      setManagementStatus({
        tone: 'error',
        text: error.message || 'No se ha podido borrar la captura.',
      });
    }
  };

  const handleDeleteWater = (water) => {
    const relatedCount = catchCountByWaterId[water.id] ?? 0;
    const confirmed = window.confirm(
      `Vas a borrar el escenario ${water.shortName}${relatedCount ? ` y ${relatedCount} capturas asociadas` : ''}. ¿Quieres continuar?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteWater(water.id);

      if (editingWaterId === water.id) {
        clearWaterEditor();
      }

      if (captureForm.waterId === water.id) {
        setCaptureForm((current) => ({ ...current, waterId: waters[0]?.id ?? '' }));
      }

      setManagementStatus({
        tone: 'success',
        text: relatedCount
          ? `Escenario borrado. Tambien se han eliminado ${relatedCount} capturas asociadas.`
          : 'El escenario se ha borrado correctamente.',
      });
    } catch (error) {
      setManagementStatus({
        tone: 'error',
        text: error.message || 'No se ha podido borrar el escenario.',
      });
    }
  };

  const downloadJsonFile = (payload, filename) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setManagementStatus(null);
    downloadJsonFile(exportPayload, `teams-bloster-respaldo-${today}.json`);

    setManagementStatus({
      tone: 'success',
      text: 'Respaldo exportado correctamente con altas, ediciones y borrados locales.',
    });
  };

  const handleProjectSyncExport = () => {
    setManagementStatus(null);
    downloadJsonFile(projectSyncPayload, 'project-overrides.json');

    setManagementStatus({
      tone: 'success',
      text: 'Archivo de proyecto exportado. Guardalo dentro de public/data/project-overrides.json y luego haz git add, git commit y git push para que Vercel muestre esos cambios.',
    });
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportStatus(null);
    setIsImportingBackup(true);

    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const result = importCustomData(parsed);
      const importedPieces = [];

      if (result.importedWaters > 0) {
        importedPieces.push(`${result.importedWaters} escenarios nuevos`);
      }

      if (result.importedCatches > 0) {
        importedPieces.push(`${result.importedCatches} capturas nuevas`);
      }

      if (result.importedEditedWaters > 0) {
        importedPieces.push(`${result.importedEditedWaters} escenarios editados`);
      }

      if (result.importedEditedCatches > 0) {
        importedPieces.push(`${result.importedEditedCatches} capturas editadas`);
      }

      if (result.deletedWaters > 0) {
        importedPieces.push(`${result.deletedWaters} borrados de escenarios`);
      }

      if (result.deletedCatches > 0) {
        importedPieces.push(`${result.deletedCatches} borrados de capturas`);
      }

      const skippedText =
        result.skippedCatches > 0
          ? ` Se han omitido ${result.skippedCatches} capturas porque no coincidian con un pescador, escenario o cebo disponible.`
          : '';

      setImportStatus({
        tone: 'success',
        text: `Respaldo importado correctamente: ${importedPieces.join(' y ') || 'sin cambios visibles'}.${skippedText}`,
      });
    } catch (error) {
      setImportStatus({
        tone: 'error',
        text: error.message || 'No se ha podido importar el respaldo.',
      });
    } finally {
      setIsImportingBackup(false);
      event.target.value = '';
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Se borraran las capturas nuevas, las ediciones y los borrados guardados en este navegador. ¿Quieres continuar?',
    );

    if (!confirmed) {
      return;
    }

    resetCustomData();
    clearCaptureEditor();
    clearWaterEditor();
    setCaptureStatus(null);
    setWaterStatus(null);
    setImportStatus(null);
    setManagementStatus({
      tone: 'success',
      text: 'Se han limpiado todas las modificaciones locales guardadas en este navegador.',
    });
  };

  return (
    <>
      <Hero
        eyebrow="Formulario"
        title="Sube, edita y borra capturas o escenarios"
        description="Ahora el panel deja crear contenido nuevo, modificar lo que ya existe y borrarlo con confirmacion antes de eliminarlo. Tambien he anadido Koi, Barbo, Pez gato y el escenario Portugal."
        compact
        backgroundImage="images/logo.png"
      />

      <section className="section section-alt">
        <div className="site-container">
          <SectionHeading
            overline="Carga de contenido"
            title="Formularios completos para el equipo"
            text="El panel sirve tanto para crear como para modificar. Si cargas una captura o escenario para editarlo, el mismo formulario cambia al modo edicion."
          />

          <div className="panel-editor-grid">
            <article className="info-card form-card">
              <div className="form-card-heading">
                <span className="eyebrow">
                  {editingCaptureId ? 'Editar captura' : 'Nueva captura'}
                </span>
                <h3>Subir foto y datos de la captura</h3>
                <p>
                  Escenario, cebo, montaje y tipo de pez salen a elegir. Si anades un montaje
                  nuevo, quedara disponible despues en el selector.
                </p>
              </div>

              <form className="editor-form" onSubmit={handleCaptureSubmit}>
                <label className="field field-file">
                  <span>Foto de la captura</span>
                  <input
                    key={captureFileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleCaptureImageChange}
                  />
                  <small>
                    {isProcessingCaptureImage
                      ? 'Optimizando imagen...'
                      : captureImageName ||
                        (editingCaptureId
                          ? 'Si no subes otra, se mantiene la imagen actual.'
                          : 'Sube una foto desde tu movil o tu ordenador.')}
                  </small>
                </label>

                {captureImage ? (
                  <div className="upload-preview">
                    <img src={assetPath(captureImage)} alt="Previsualizacion de la captura" />
                  </div>
                ) : null}

                <div className="form-grid-two">
                  <label className="field">
                    <span>Pescador</span>
                    <select
                      name="memberId"
                      value={captureForm.memberId}
                      onChange={handleCaptureFieldChange}
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Tipo de pez</span>
                    <select
                      name="carpType"
                      value={captureForm.carpType}
                      onChange={handleCaptureFieldChange}
                    >
                      {FISH_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Peso (kg)</span>
                    <input
                      type="number"
                      name="weightKg"
                      min="0"
                      step="0.1"
                      value={captureForm.weightKg}
                      onChange={handleCaptureFieldChange}
                      placeholder="Ej: 9.0"
                    />
                  </label>

                  <label className="field">
                    <span>Fecha</span>
                    <input
                      type="date"
                      name="date"
                      value={captureForm.date}
                      onChange={handleCaptureFieldChange}
                    />
                  </label>

                  <label className="field field-span-two">
                    <span>Escenario</span>
                    <select
                      name="waterId"
                      value={captureForm.waterId}
                      onChange={handleCaptureFieldChange}
                    >
                      {waters.map((water) => (
                        <option key={water.id} value={water.id}>
                          {water.shortName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field field-span-two">
                    <span>Cebo</span>
                    <select
                      name="baitId"
                      value={captureForm.baitId}
                      onChange={handleCaptureFieldChange}
                    >
                      {baits.map((bait) => (
                        <option key={bait.id} value={bait.id}>
                          {bait.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field field-span-two">
                    <span>Montaje</span>
                    <select
                      name="rig"
                      value={captureForm.rig}
                      onChange={handleCaptureFieldChange}
                    >
                      {rigOptions.map((rig) => (
                        <option key={rig} value={rig}>
                          {rig}
                        </option>
                      ))}
                      <option value="__custom__">Anadir montaje manualmente</option>
                    </select>
                  </label>

                  {captureForm.rig === '__custom__' ? (
                    <label className="field field-span-two">
                      <span>Montaje personalizado</span>
                      <input
                        type="text"
                        name="customRig"
                        value={captureForm.customRig}
                        onChange={handleCaptureFieldChange}
                        placeholder="Ej: Ronnie rig corto"
                      />
                    </label>
                  ) : null}
                </div>

                {captureStatus ? (
                  <div className={`status-message status-${captureStatus.tone}`}>
                    {captureStatus.text}
                  </div>
                ) : null}

                <div className="panel-actions panel-actions-wrap">
                  <button className="button button-primary" type="submit">
                    {editingCaptureId ? 'Guardar cambios' : 'Guardar captura'}
                  </button>
                  {editingCaptureId ? (
                    <button
                      className="button button-secondary button-small"
                      type="button"
                      onClick={clearCaptureEditor}
                    >
                      Cancelar edicion
                    </button>
                  ) : null}
                </div>
              </form>
            </article>

            <article className="info-card form-card">
              <div className="form-card-heading">
                <span className="eyebrow">
                  {editingWaterId ? 'Editar escenario' : 'Nuevo escenario'}
                </span>
                <h3>Crear o modificar un escenario</h3>
                <p>
                  Puedes dar de alta escenarios nuevos, incluir Portugal como ubicacion general y
                  ajustar despues texto, web, imagen o etiquetas cuando quieras.
                </p>
              </div>

              <form className="editor-form" onSubmit={handleWaterSubmit}>
                <label className="field field-file">
                  <span>Imagen del escenario</span>
                  <input
                    key={waterFileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleWaterImageChange}
                  />
                  <small>
                    {isProcessingWaterImage
                      ? 'Optimizando imagen...'
                      : waterImageName ||
                        (editingWaterId
                          ? 'Si no subes otra, se mantiene la imagen actual.'
                          : 'Opcional. Si no subes nada, se usa el logo como fondo.')}
                  </small>
                </label>

                {waterImage ? (
                  <div className="upload-preview upload-preview-scenery">
                    <img src={assetPath(waterImage)} alt="Previsualizacion del escenario" />
                  </div>
                ) : null}

                <div className="form-grid-two">
                  <label className="field">
                    <span>Nombre completo</span>
                    <input
                      type="text"
                      name="name"
                      value={waterForm.name}
                      onChange={handleWaterFieldChange}
                      placeholder="Ej: Embalse de Alange"
                    />
                  </label>

                  <label className="field">
                    <span>Tipo</span>
                    <select
                      name="type"
                      value={waterForm.type}
                      onChange={handleWaterFieldChange}
                    >
                      {waterTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Provincia o zona</span>
                    <input
                      type="text"
                      name="province"
                      list="province-suggestions"
                      value={waterForm.province}
                      onChange={handleWaterFieldChange}
                      placeholder="Ej: Badajoz o Portugal"
                    />
                    <datalist id="province-suggestions">
                      {provinceSuggestions.map((province) => (
                        <option key={province} value={province} />
                      ))}
                    </datalist>
                  </label>

                  <label className="field field-span-two">
                    <span>Descripcion</span>
                    <textarea
                      name="description"
                      rows="3"
                      value={waterForm.description}
                      onChange={handleWaterFieldChange}
                      placeholder="Resumen rapido del escenario."
                    />
                  </label>

                  <label className="field">
                    <span>Conocida por</span>
                    <input
                      type="text"
                      name="knownFor"
                      value={waterForm.knownFor}
                      onChange={handleWaterFieldChange}
                      placeholder="Ej: Grandes peces y largas distancias"
                    />
                  </label>

                  <label className="field">
                    <span>Mejor temporada</span>
                    <input
                      type="text"
                      name="bestSeason"
                      value={waterForm.bestSeason}
                      onChange={handleWaterFieldChange}
                      placeholder="Ej: Primavera y verano"
                    />
                  </label>

                  <label className="field">
                    <span>Dificultad</span>
                    <select
                      name="difficulty"
                      value={waterForm.difficulty}
                      onChange={handleWaterFieldChange}
                    >
                      {waterDifficultyOptions.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Web o mapa</span>
                    <input
                      type="url"
                      name="website"
                      value={waterForm.website}
                      onChange={handleWaterFieldChange}
                      placeholder="https://..."
                    />
                  </label>
                </div>

                {waterStatus ? (
                  <div className={`status-message status-${waterStatus.tone}`}>
                    {waterStatus.text}
                  </div>
                ) : null}

                <div className="panel-actions panel-actions-wrap">
                  <button className="button button-primary" type="submit">
                    {editingWaterId ? 'Guardar cambios' : 'Crear escenario'}
                  </button>
                  {editingWaterId ? (
                    <button
                      className="button button-secondary button-small"
                      type="button"
                      onClick={clearWaterEditor}
                    >
                      Cancelar edicion
                    </button>
                  ) : null}
                </div>
              </form>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            overline="Gestion"
            title="Editar, borrar o respaldar"
            text="Desde aqui puedes revisar todo lo cargado, editar cualquier captura o escenario y borrar con confirmacion antes de eliminarlo."
          />

          {managementStatus ? (
            <div className={`status-message status-${managementStatus.tone}`}>{managementStatus.text}</div>
          ) : null}

          <div className="management-grid">
            <article className="info-card management-card">
              <div className="form-card-heading">
                <span className="eyebrow">Capturas</span>
                <h3>Editar o borrar capturas</h3>
                <p>Incluye las capturas base y tambien las que se hayan subido desde el panel.</p>
              </div>

              <div className="management-stats">
                <div>
                  <span>Total visibles</span>
                  <strong>{sortedCatches.length}</strong>
                </div>
                <div>
                  <span>Koi</span>
                  <strong>{sortedCatches.filter((capture) => capture.carpType === 'koi').length}</strong>
                </div>
                <div>
                  <span>Otras especies</span>
                  <strong>
                    {
                      sortedCatches.filter(
                        (capture) => capture.carpType === 'barbo' || capture.carpType === 'pez-gato',
                      ).length
                    }
                  </strong>
                </div>
              </div>

              {sortedCatches.length === 0 ? (
                <EmptyState
                  title="No hay capturas para gestionar"
                  text="Sube una nueva desde el formulario para empezar."
                />
              ) : (
                <div className="mini-entry-list mini-entry-list-scroll">
                  {sortedCatches.map((capture) => {
                    const member = membersById[capture.memberId];
                    const water = watersById[capture.waterId];

                    return (
                      <div className="mini-entry mini-entry-stacked" key={capture.id}>
                        <div>
                          <strong>
                            {member?.name || 'Pescador'} · {water?.shortName || 'Escenario'}
                          </strong>
                          <span>
                            {formatDate(capture.date)} · {formatWeight(capture.weightKg)} · {formatFishType(capture.carpType)}
                          </span>
                          <small>{capture.source === 'custom' ? 'Captura anadida desde el panel' : 'Captura base'}</small>
                        </div>

                        <div className="card-actions card-actions-compact">
                          <button
                            className="button button-secondary button-small"
                            type="button"
                            onClick={() => startEditingCapture(capture)}
                          >
                            Editar
                          </button>
                          <button
                            className="button button-secondary button-small button-danger"
                            type="button"
                            onClick={() => handleDeleteCapture(capture)}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="info-card management-card">
              <div className="form-card-heading">
                <span className="eyebrow">Escenarios</span>
                <h3>Editar o borrar escenarios</h3>
                <p>Cualquier cambio se refleja en filtros, fichas y formularios al momento.</p>
              </div>

              <div className="management-stats">
                <div>
                  <span>Total visibles</span>
                  <strong>{sortedWaters.length}</strong>
                </div>
                <div>
                  <span>Con capturas</span>
                  <strong>{sortedWaters.filter((water) => (catchCountByWaterId[water.id] ?? 0) > 0).length}</strong>
                </div>
                <div>
                  <span>Nuevos</span>
                  <strong>{customCounts.waters}</strong>
                </div>
              </div>

              {sortedWaters.length === 0 ? (
                <EmptyState
                  title="No hay escenarios para gestionar"
                  text="Crea uno nuevo desde el formulario superior."
                />
              ) : (
                <div className="mini-entry-list mini-entry-list-scroll">
                  {sortedWaters.map((water) => (
                    <div className="mini-entry mini-entry-stacked" key={water.id}>
                      <div>
                        <strong>{water.shortName}</strong>
                        <span>
                          {water.type} · {water.province} · {catchCountByWaterId[water.id] ?? 0} capturas
                        </span>
                        <small>{water.source === 'custom' ? 'Escenario anadido desde el panel' : 'Escenario base'}</small>
                      </div>

                      <div className="card-actions card-actions-compact">
                        <button
                          className="button button-secondary button-small"
                          type="button"
                          onClick={() => startEditingWater(water)}
                        >
                          Editar
                        </button>
                        <button
                          className="button button-secondary button-small button-danger"
                          type="button"
                          onClick={() => handleDeleteWater(water)}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="info-card management-card">
              <div className="form-card-heading">
                <span className="eyebrow">Respaldo</span>
                <h3>Guardar o recuperar cambios</h3>
                <p>
                  Exporta tus altas, ediciones y borrados a un JSON y recuperalos luego en otro
                  dispositivo si lo necesitas.
                </p>
                <p>
                  Para que tambien aparezcan en GitHub y en Vercel, usa <strong>Exportar para GitHub y Vercel</strong>,
                  copia ese archivo sobre <strong>{projectSyncFilePath}</strong> dentro de tu proyecto local y despues haz push.
                </p>
                <p>
                  Estado del archivo del proyecto: <strong>{projectSyncStatus === 'ready' ? 'cargado' : 'pendiente o vacio'}</strong>.
                </p>
              </div>

              <div className="management-stats">
                <div>
                  <span>Ediciones</span>
                  <strong>{customCounts.editedWaters + customCounts.editedCatches}</strong>
                </div>
                <div>
                  <span>Borrados</span>
                  <strong>{customCounts.deletedWaters + customCounts.deletedCatches}</strong>
                </div>
                <div>
                  <span>Cambios totales</span>
                  <strong>{customCounts.totalChanges}</strong>
                </div>
                <div>
                  <span>Sincronizados en proyecto</span>
                  <strong>{customCounts.syncedWaters + customCounts.syncedCatches + customCounts.syncedEditedWaters + customCounts.syncedEditedCatches}</strong>
                </div>
              </div>

              {importStatus ? (
                <div className={`status-message status-${importStatus.tone}`}>{importStatus.text}</div>
              ) : null}

              <div className="panel-actions panel-actions-wrap">
                <button className="button button-primary" type="button" onClick={handleExport}>
                  Exportar respaldo local
                </button>
                <button
                  className="button button-secondary button-small"
                  type="button"
                  onClick={handleProjectSyncExport}
                >
                  Exportar para GitHub y Vercel
                </button>
                <label className="button button-secondary button-small button-file-inline">
                  {isImportingBackup ? 'Importando...' : 'Importar JSON'}
                  <input type="file" accept="application/json" onChange={handleImportBackup} />
                </label>
                <button className="button button-secondary button-small" type="button" onClick={handleReset}>
                  Limpiar cambios locales
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
