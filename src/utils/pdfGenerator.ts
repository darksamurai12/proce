import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportPdfOptions {
  filename: string;
  elementId?: string;
  element?: HTMLElement | null;
  fitSinglePage?: boolean;
}

/**
 * Converte um elemento HTML em ficheiro PDF A4 de alta qualidade e faz o download direto.
 * Garante enquadramento ideal na folha A4 com largura completa e margens simétricas.
 */
export async function exportElementToPdf({
  filename,
  elementId,
  element,
  fitSinglePage = true,
}: ExportPdfOptions): Promise<boolean> {
  const target = element || (elementId ? document.getElementById(elementId) : null);
  if (!target) {
    console.error('Elemento não encontrado para gerar PDF:', elementId);
    return false;
  }

  try {
    // Determina a largura alvo (usa 800px como padrão para recibos em folha A4)
    const targetWidth = target.scrollWidth || 800;

    const dataUrl = await toPng(target, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      cacheBust: true,
      width: targetWidth,
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Falha ao processar imagem para conversão em PDF'));
      img.src = dataUrl;
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Margens da folha A4 (12mm nas laterais e 12mm no topo)
    const marginX = 12;
    const marginY = 12;
    const availableWidth = pageWidth - marginX * 2; // 186mm
    const availableHeight = pageHeight - marginY * 2; // 273mm

    const imgAspectRatio = img.naturalHeight / img.naturalWidth;
    let renderWidth = availableWidth;
    let renderHeight = renderWidth * imgAspectRatio;

    if (fitSinglePage) {
      // Se a altura ultrapassar o espaço disponível na página A4, escala proporcionalmente
      if (renderHeight > availableHeight) {
        const scale = availableHeight / renderHeight;
        renderHeight = availableHeight;
        renderWidth = renderWidth * scale;
      }
      // Centraliza horizontalmente e aplica margem superior
      const posX = (pageWidth - renderWidth) / 2;
      const posY = marginY;
      pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight);
    } else {
      if (renderHeight <= availableHeight) {
        const posX = (pageWidth - renderWidth) / 2;
        pdf.addImage(dataUrl, 'PNG', posX, marginY, renderWidth, renderHeight);
      } else {
        let heightLeft = renderHeight;
        let position = marginY;

        pdf.addImage(dataUrl, 'PNG', marginX, position, renderWidth, renderHeight);
        heightLeft -= availableHeight;

        while (heightLeft > 0) {
          position = marginY - (renderHeight - heightLeft);
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', marginX, position, renderWidth, renderHeight);
          heightLeft -= availableHeight;
        }
      }
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
}
