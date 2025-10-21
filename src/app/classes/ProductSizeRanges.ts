/**
 * ProductSizeRanges - Static utility class for product size ranges
 */
export class ProductSizeRanges {

  /**
   * Pantalón dama: 0 al 20
   */
  static readonly PANTALON_DAMA: string[] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
  ];

  /**
   * Pantalón caballero: 28 al 40
   */
  static readonly PANTALON_CABALLERO: string[] = [
    '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'
  ];

  /**
   * Camisas, chalecos, sudaderas, chamarras: XS a 3XL
   */
  static readonly CAMISAS_CHALECOS_SUDADERAS_CHAMARRAS: string[] = [
    'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'
  ];

  /**
   * Calzado: 20 al 32
   */
  static readonly CALZADO: string[] = [
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'
  ];
}
