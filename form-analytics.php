<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.booshlin.com
 * @since             1.0.1
 * @package           Form_Analytics
 *
 * @wordpress-plugin
 * Plugin Name:       Form Analytics
 * Plugin URI:        https://www.booshlin.com/form-analytics/
 * Description:       .
 * Version:           1.0.1
 * Author:            Booshlin
 * Author URI:        https://www.booshlin.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       form-analytics
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'FORM_ANALYTICS_VERSION', '1.0.0' );


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-form-analytics.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_form_analytics() {

	$plugin = new Form_Analytics();
	$plugin->run();

}
run_form_analytics();
