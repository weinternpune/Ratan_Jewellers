import axios from 'axios';
import { logger } from '../utils/logger';

interface WAMessagePayload {
  invoiceId: string;
  phone: string;
  pdfUrl: string;
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
}

export const sendWhatsAppMessage = async (
  payload: WAMessagePayload
): Promise<void> => {
  const {
    phone,
    pdfUrl,
    customerName,
    invoiceNumber,
    totalAmount,
  } = payload;

  const sendWithRetry = async (
    attempt: number
  ): Promise<void> => {
    try {
      const formattedPhone = phone.startsWith('+')
        ? phone.substring(1)
        : `91${phone.replace(/\D/g, '')}`;

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',

          to: formattedPhone,

          type: 'template',

          template: {
            name: 'invoice_notification',

            language: {
              code: 'en_IN',
            },

            components: [
              {
                type: 'header',

                parameters: [
                  {
                    type: 'document',

                    document: {
                      link: pdfUrl,
                      filename: `Invoice_${invoiceNumber}.pdf`,
                    },
                  },
                ],
              },

              {
                type: 'body',

                parameters: [
                  {
                    type: 'text',
                    text: customerName,
                  },

                  {
                    type: 'text',
                    text: invoiceNumber,
                  },

                  {
                    type: 'text',
                    text: `₹${totalAmount.toLocaleString(
                      'en-IN'
                    )}`,
                  },
                ],
              },
            ],
          },
        },

        {
          headers: {
            Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,

            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(
        `WhatsApp sent successfully to ${phone} for invoice ${invoiceNumber}`
      );

      logger.info(response.data);
    } catch (error: any) {
      logger.error(
        `WhatsApp send attempt ${attempt} failed`
      );

      logger.error(error.message);

      if (attempt < 3) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * attempt)
        );

        await sendWithRetry(attempt + 1);
      } else {
        logger.error(
          `WhatsApp failed permanently for ${phone}`
        );

        await sendSMSFallback(
          phone,
          invoiceNumber,
          totalAmount
        );
      }
    }
  };

  await sendWithRetry(1);
};

const sendSMSFallback = async (
  phone: string,
  invoiceNumber: string,
  totalAmount: number
) => {
  logger.info(
    `SMS fallback triggered for ${phone}`
  );

  logger.info({
    invoiceNumber,
    totalAmount,
  });
};